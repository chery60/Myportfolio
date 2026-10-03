import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createGeminiProxy,
  DEFAULT_ALLOWED_ORIGINS,
  MAX_BODY_BYTES,
  MAX_OUTPUT_TOKENS,
  parseAllowedOrigins,
  parseTarget,
  sanitizeRequestBody,
} from "./gemini-proxy.js";

const SITE_ORIGIN = "https://chery60.github.io";
const STREAM_PATH =
  "/api/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent";
const VALID_BODY = {
  contents: [{ role: "user", parts: [{ text: "Hi" }] }],
  generationConfig: { maxOutputTokens: 400 },
};

function makeRequest({
  path = STREAM_PATH,
  method = "POST",
  origin = SITE_ORIGIN,
  body = JSON.stringify(VALID_BODY),
  headers = {},
} = {}) {
  return new Request(`https://proxy.example${path}?alt=sse`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(origin ? { origin } : {}),
      ...headers,
    },
    body: method === "POST" ? body : undefined,
  });
}

function makeProxy(overrides = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response("data: {}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  };
  const proxy = createGeminiProxy({
    apiKey: "server-key",
    allowedOrigins: [SITE_ORIGIN],
    fetchImpl,
    logError: () => {},
    ...overrides,
  });
  return { proxy, calls };
}

describe("parseTarget", () => {
  test("accepts the allowed model with a streaming method", () => {
    assert.deepEqual(parseTarget(STREAM_PATH), {
      model: "gemini-3.5-flash-lite",
      method: "streamGenerateContent",
    });
  });

  test("accepts a percent-encoded colon", () => {
    assert.deepEqual(
      parseTarget("/api/v1beta/models/gemini-3.5-flash-lite%3AgenerateContent"),
      { model: "gemini-3.5-flash-lite", method: "generateContent" }
    );
  });

  test("rejects a model outside the allowlist", () => {
    assert.equal(
      parseTarget("/api/v1beta/models/gemini-3.5-pro:generateContent"),
      null
    );
  });

  test("rejects a method outside the allowlist", () => {
    assert.equal(
      parseTarget("/api/v1beta/models/gemini-3.5-flash-lite:embedContent"),
      null
    );
  });

  test("rejects extra colon-separated segments", () => {
    assert.equal(
      parseTarget(
        "/api/v1beta/models/gemini-3.5-flash-lite:generateContent:x"
      ),
      null
    );
  });

  test("rejects malformed percent-encoding instead of throwing", () => {
    assert.equal(parseTarget("/api/v1beta/models/%E0%A4%A"), null);
  });
});

describe("sanitizeRequestBody", () => {
  test("drops fields the assistant never sends, such as paid tools", () => {
    const result = sanitizeRequestBody({
      ...VALID_BODY,
      tools: [{ googleSearch: {} }],
      cachedContent: "cachedContents/abc",
      safetySettings: [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }],
    });
    assert.equal("tools" in result, false);
    assert.equal("cachedContent" in result, false);
    assert.equal("safetySettings" in result, false);
    assert.deepEqual(result.contents, VALID_BODY.contents);
  });

  test("keeps a text-only system instruction and model turns with signatures", () => {
    const body = {
      systemInstruction: { parts: [{ text: "You are a pet." }] },
      contents: [
        { role: "user", parts: [{ text: "Hi" }] },
        {
          role: "model",
          parts: [
            { text: "thinking", thought: true, thoughtSignature: "sig1" },
            { text: "Hello!", thoughtSignature: "sig2" },
          ],
        },
        { role: "user", parts: [{ text: "Who is Sai?" }] },
      ],
    };
    const result = sanitizeRequestBody(body);
    assert.deepEqual(result.systemInstruction, body.systemInstruction);
    assert.deepEqual(result.contents, body.contents);
  });

  test("rejects file, inline-data and tool-call parts", () => {
    const nonTextParts = [
      { fileData: { fileUri: "https://youtube.com/watch?v=x", mimeType: "video/mp4" } },
      { inlineData: { data: "AAAA", mimeType: "application/pdf" } },
      { functionCall: { name: "x", args: {} } },
      "just a string",
    ];
    for (const part of nonTextParts) {
      const body = { contents: [{ role: "user", parts: [part] }] };
      assert.equal(sanitizeRequestBody(body), null, JSON.stringify(part));
    }
  });

  test("strips extra keys smuggled onto a text part", () => {
    const result = sanitizeRequestBody({
      contents: [
        {
          role: "user",
          parts: [{ text: "Hi", fileData: { fileUri: "gs://x", mimeType: "a/b" } }],
        },
      ],
    });
    assert.deepEqual(result.contents, [{ role: "user", parts: [{ text: "Hi" }] }]);
  });

  test("rejects malformed contents and unknown roles", () => {
    for (const contents of [undefined, "Hi", [null], [{ role: "system", parts: [{ text: "x" }] }], [{ role: "user" }]]) {
      assert.equal(sanitizeRequestBody({ contents }), null, JSON.stringify(contents));
    }
  });

  test("rejects a system instruction that is not text-only", () => {
    const body = {
      ...VALID_BODY,
      systemInstruction: { parts: [{ inlineData: { data: "AAAA", mimeType: "image/png" } }] },
    };
    assert.equal(sanitizeRequestBody(body), null);
  });

  test("forwards only the generation settings the assistant uses", () => {
    const result = sanitizeRequestBody({
      ...VALID_BODY,
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        stopSequences: ["END"],
        thinkingConfig: { thinkingLevel: "minimal", includeThoughts: false, thinkingBudget: 24_576 },
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: {} },
        responseJsonSchema: { type: "object" },
      },
    });
    assert.deepEqual(result.generationConfig, {
      temperature: 0.4,
      topP: 0.9,
      stopSequences: ["END"],
      thinkingConfig: { thinkingLevel: "minimal", includeThoughts: false },
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      candidateCount: 1,
    });
  });

  test("clamps maxOutputTokens down to the ceiling", () => {
    const result = sanitizeRequestBody({
      ...VALID_BODY,
      generationConfig: { maxOutputTokens: 60_000, temperature: 0.4 },
    });
    assert.equal(result.generationConfig.maxOutputTokens, MAX_OUTPUT_TOKENS);
    assert.equal(result.generationConfig.temperature, 0.4);
  });

  test("keeps a smaller maxOutputTokens as requested", () => {
    const result = sanitizeRequestBody({
      ...VALID_BODY,
      generationConfig: { maxOutputTokens: 120 },
    });
    assert.equal(result.generationConfig.maxOutputTokens, 120);
  });

  test("applies the ceiling when generationConfig is missing or malformed", () => {
    for (const generationConfig of [undefined, "lots", [1, 2], null]) {
      const result = sanitizeRequestBody({ ...VALID_BODY, generationConfig });
      assert.equal(result.generationConfig.maxOutputTokens, MAX_OUTPUT_TOKENS);
    }
  });

  test("forces a single candidate so one request cannot bill many replies", () => {
    const result = sanitizeRequestBody({
      ...VALID_BODY,
      generationConfig: { candidateCount: 8 },
    });
    assert.equal(result.generationConfig.candidateCount, 1);
  });

  test("does not mutate its input", () => {
    const input = structuredClone({
      ...VALID_BODY,
      generationConfig: { maxOutputTokens: 9_000 },
    });
    const snapshot = structuredClone(input);
    sanitizeRequestBody(input);
    assert.deepEqual(input, snapshot);
  });
});

describe("parseAllowedOrigins", () => {
  test("falls back to the defaults when unset", () => {
    assert.deepEqual(parseAllowedOrigins(undefined), DEFAULT_ALLOWED_ORIGINS);
    assert.deepEqual(parseAllowedOrigins(""), DEFAULT_ALLOWED_ORIGINS);
  });

  test("splits and trims a comma-separated list", () => {
    assert.deepEqual(parseAllowedOrigins(" https://a.dev , https://b.dev,"), [
      "https://a.dev",
      "https://b.dev",
    ]);
  });
});

describe("OPTIONS preflight", () => {
  test("allows the site origin and echoes the requested headers", () => {
    const { proxy } = makeProxy();
    const response = proxy.OPTIONS(
      makeRequest({
        method: "OPTIONS",
        headers: {
          "access-control-request-headers": "content-type,x-goog-api-key",
        },
      })
    );
    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      SITE_ORIGIN
    );
    assert.equal(
      response.headers.get("access-control-allow-headers"),
      "content-type,x-goog-api-key"
    );
  });

  test("refuses an unknown origin", () => {
    const { proxy } = makeProxy();
    const response = proxy.OPTIONS(
      makeRequest({ method: "OPTIONS", origin: "https://evil.example" })
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  });
});

describe("POST", () => {
  test("forwards to Gemini with the server key, never the client's", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(
      makeRequest({ headers: { "x-goog-api-key": "client-supplied" } })
    );

    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse"
    );
    assert.equal(calls[0].init.headers["x-goog-api-key"], "server-key");
    assert.deepEqual(JSON.parse(calls[0].init.body), sanitizeRequestBody(VALID_BODY));
  });

  test("streams the upstream body back with CORS headers", async () => {
    const { proxy } = makeProxy();
    const response = await proxy.POST(makeRequest());
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      SITE_ORIGIN
    );
    assert.equal(response.headers.get("content-type"), "text/event-stream");
    assert.equal(await response.text(), "data: {}\n\n");
  });

  test("does not add alt=sse to non-streaming calls", async () => {
    const { proxy, calls } = makeProxy();
    await proxy.POST(
      makeRequest({
        path: "/api/v1beta/models/gemini-3.5-flash-lite:generateContent",
      })
    );
    assert.equal(
      calls[0].url,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
    );
  });

  test("refuses an unknown origin without calling Gemini", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(
      makeRequest({ origin: "https://evil.example" })
    );
    assert.equal(response.status, 403);
    assert.equal(calls.length, 0);
  });

  test("refuses a request with no origin header", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(makeRequest({ origin: null }));
    assert.equal(response.status, 403);
    assert.equal(calls.length, 0);
  });

  test("returns 404 for a model outside the allowlist", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(
      makeRequest({ path: "/api/v1beta/models/gemini-3.5-pro:generateContent" })
    );
    assert.equal(response.status, 404);
    assert.equal(calls.length, 0);
  });

  test("returns 413 for an oversized body", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(
      makeRequest({
        body: JSON.stringify({
          contents: [{ parts: [{ text: "x".repeat(MAX_BODY_BYTES) }] }],
        }),
      })
    );
    assert.equal(response.status, 413);
    assert.equal(calls.length, 0);
  });

  test("returns 400 without calling Gemini when a message carries a file", async () => {
    const { proxy, calls } = makeProxy();
    const response = await proxy.POST(
      makeRequest({
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ fileData: { fileUri: "gs://x", mimeType: "a/b" } }] },
          ],
        }),
      })
    );
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  test("marks every response nosniff", async () => {
    const { proxy } = makeProxy();
    const ok = await proxy.POST(makeRequest());
    const rejected = await proxy.POST(makeRequest({ origin: "https://evil.example" }));
    assert.equal(ok.headers.get("x-content-type-options"), "nosniff");
    assert.equal(rejected.headers.get("x-content-type-options"), "nosniff");
  });

  test("hides Gemini's auth and server errors behind a generic 502", async () => {
    for (const status of [401, 403, 500, 503]) {
      const logged = [];
      const { proxy } = makeProxy({
        fetchImpl: async () =>
          new Response('{"error":{"message":"API key not valid. project 123"}}', {
            status,
            headers: { "content-type": "application/json" },
          }),
        logError: (...args) => logged.push(args),
      });
      const response = await proxy.POST(makeRequest());
      assert.equal(response.status, 502, `upstream ${status}`);
      assert.doesNotMatch(await response.text(), /project 123/);
      assert.equal(logged.length, 1);
    }
  });

  test("passes Gemini's 400 through so the SDK can explain it", async () => {
    const { proxy } = makeProxy({
      fetchImpl: async () =>
        new Response('{"error":{"code":400}}', {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
    });
    const response = await proxy.POST(makeRequest());
    assert.equal(response.status, 400);
  });

  test("gives up on Gemini after the upstream timeout", async () => {
    const logged = [];
    const { proxy } = makeProxy({
      upstreamTimeoutMs: 5,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(init.signal.reason));
        }),
      logError: (...args) => logged.push(args),
    });
    const response = await proxy.POST(makeRequest());
    assert.equal(response.status, 502);
    assert.equal(logged.length, 1);
  });

  test("returns 400 for a body that is not a JSON object", async () => {
    const { proxy, calls } = makeProxy();
    for (const body of ["{not json", "[]", "null", "42"]) {
      const response = await proxy.POST(makeRequest({ body }));
      assert.equal(response.status, 400, `body ${body}`);
    }
    assert.equal(calls.length, 0);
  });

  test("returns 503 and logs when the server key is missing", async () => {
    const logged = [];
    const { proxy, calls } = makeProxy({
      apiKey: "",
      logError: (...args) => logged.push(args),
    });
    const response = await proxy.POST(makeRequest());
    assert.equal(response.status, 503);
    assert.equal(calls.length, 0);
    assert.equal(logged.length, 1);
  });

  test("returns 502 and logs when Gemini cannot be reached", async () => {
    const logged = [];
    const { proxy } = makeProxy({
      fetchImpl: async () => {
        throw new TypeError("fetch failed");
      },
      logError: (...args) => logged.push(args),
    });
    const response = await proxy.POST(makeRequest());
    assert.equal(response.status, 502);
    assert.equal(logged.length, 1);
  });

  test("passes Gemini's own error status through, e.g. a quota 429", async () => {
    const { proxy } = makeProxy({
      fetchImpl: async () =>
        new Response('{"error":{"code":429}}', {
          status: 429,
          headers: { "content-type": "application/json" },
        }),
    });
    const response = await proxy.POST(makeRequest());
    assert.equal(response.status, 429);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      SITE_ORIGIN
    );
  });
});
