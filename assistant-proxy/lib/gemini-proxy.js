/**
 * A narrow pass-through to the Gemini API that keeps the key off the browser.
 *
 * The portfolio is a static export on GitHub Pages, so it cannot hold a secret.
 * The AI SDK in the browser points its `baseURL` here instead; this adds the
 * key and forwards only what the pet assistant actually sends.
 *
 * The origin check stops other websites from using the proxy from a browser,
 * but a script can forge an `Origin` header. The real spend ceiling is the
 * daily quota set on the Google Cloud project — see README.
 */

const GEMINI_MODELS_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/** Mirrors MODEL_ID in src/lib/pet-assistant-agent.ts. */
const ALLOWED_MODELS = new Set(["gemini-3.5-flash-lite"]);
const ALLOWED_METHODS = new Set(["generateContent", "streamGenerateContent"]);
const STREAMING_METHOD = "streamGenerateContent";

/**
 * Mirrors MAX_OUTPUT_TOKENS in the client, and is enforced here because the
 * client is not trusted.
 */
export const MAX_OUTPUT_TOKENS = 400;

/** The system prompt is ~30 KB; an 8-turn conversation fits well within this. */
export const MAX_BODY_BYTES = 128 * 1024;

/**
 * Requests are rebuilt from these allowlists rather than passed through, so a
 * caller cannot add tools, files, safety overrides, audio output and so on.
 * They match what @ai-sdk/google sends for a text-only chat.
 */
const ALLOWED_ROLES = new Set(["user", "model"]);
const FORWARDED_GENERATION_FIELDS = [
  "temperature",
  "topP",
  "topK",
  "stopSequences",
  "seed",
  "frequencyPenalty",
  "presencePenalty",
];
const FORWARDED_THINKING_FIELDS = ["thinkingLevel", "includeThoughts"];

/** Gemini errors the AI SDK turns into useful messages (bad request, quota). Others are hidden. */
const PASSTHROUGH_ERROR_STATUSES = new Set([400, 429]);
const MAX_LOGGED_ERROR_CHARS = 500;

/** A reply is capped at 400 tokens, so a healthy stream finishes well inside this. */
const UPSTREAM_TIMEOUT_MS = 30_000;

/**
 * A trailing `:*` allows that scheme and host on any port, because `next dev`
 * moves to 3001, 3002… when 3000 is taken. Everything else matches exactly.
 */
export const DEFAULT_ALLOWED_ORIGINS = [
  "https://chery60.github.io",
  "http://localhost:*",
  "http://127.0.0.1:*",
];
const ANY_PORT_SUFFIX = ":*";
const PORT_PATTERN = /^\d{1,5}$/;

const PREFLIGHT_MAX_AGE_SECONDS = "86400";
const SECURITY_HEADERS = { "X-Content-Type-Options": "nosniff" };

function createOriginMatcher(allowedOrigins) {
  const exact = new Set(
    allowedOrigins.filter((origin) => !origin.endsWith(ANY_PORT_SUFFIX))
  );
  // "http://localhost:*" → "http://localhost:", which must be followed by a port only.
  const anyPortPrefixes = allowedOrigins
    .filter((origin) => origin.endsWith(ANY_PORT_SUFFIX))
    .map((origin) => origin.slice(0, -1));

  return (origin) => {
    if (typeof origin !== "string") return false;
    if (exact.has(origin)) return true;
    return anyPortPrefixes.some(
      (prefix) =>
        origin.startsWith(prefix) &&
        PORT_PATTERN.test(origin.slice(prefix.length))
    );
  };
}

export function parseAllowedOrigins(value) {
  if (!value) return DEFAULT_ALLOWED_ORIGINS;
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/** `/…/models/gemini-x:streamGenerateContent` → `{ model, method }`, or null. */
export function parseTarget(pathname) {
  let target;
  try {
    target = decodeURIComponent(pathname.split("/").pop() ?? "");
  } catch {
    return null;
  }
  const [model, method, ...rest] = target.split(":");
  if (rest.length > 0) return null;
  if (!ALLOWED_MODELS.has(model) || !ALLOWED_METHODS.has(method)) return null;
  return { model, method };
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick(source, fields) {
  return Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(source, field))
      .map((field) => [field, source[field]])
  );
}

/** Rebuilt with only the fields a text turn carries, or null for files, inline data and tool calls. */
function sanitizeTextPart(part) {
  if (!isPlainObject(part) || typeof part.text !== "string") return null;
  return {
    text: part.text,
    ...(typeof part.thought === "boolean" && { thought: part.thought }),
    ...(typeof part.thoughtSignature === "string" && {
      thoughtSignature: part.thoughtSignature,
    }),
  };
}

function sanitizeParts(parts) {
  if (!Array.isArray(parts)) return null;
  const sanitized = parts.map(sanitizeTextPart);
  return sanitized.includes(null) ? null : sanitized;
}

function sanitizeContents(contents) {
  if (!Array.isArray(contents)) return null;
  const sanitized = contents.map((content) => {
    if (!isPlainObject(content) || !ALLOWED_ROLES.has(content.role)) {
      return null;
    }
    const parts = sanitizeParts(content.parts);
    return parts && { role: content.role, parts };
  });
  return sanitized.includes(null) ? null : sanitized;
}

function sanitizeSystemInstruction(instruction) {
  if (!isPlainObject(instruction)) return null;
  const parts = sanitizeParts(instruction.parts);
  return parts && { parts };
}

function clampMaxOutputTokens(requested) {
  return typeof requested === "number" && requested > 0
    ? Math.min(requested, MAX_OUTPUT_TOKENS)
    : MAX_OUTPUT_TOKENS;
}

function sanitizeGenerationConfig(config) {
  const base = isPlainObject(config) ? config : {};
  const thinkingConfig = isPlainObject(base.thinkingConfig)
    ? pick(base.thinkingConfig, FORWARDED_THINKING_FIELDS)
    : null;
  return {
    ...pick(base, FORWARDED_GENERATION_FIELDS),
    ...(thinkingConfig && { thinkingConfig }),
    maxOutputTokens: clampMaxOutputTokens(base.maxOutputTokens),
    candidateCount: 1,
  };
}

/** The request rebuilt from allowlists, or null when it carries anything but text. */
export function sanitizeRequestBody(body) {
  const contents = sanitizeContents(body.contents);
  if (!contents) return null;

  const hasInstruction = body.systemInstruction != null;
  const systemInstruction = hasInstruction
    ? sanitizeSystemInstruction(body.systemInstruction)
    : null;
  if (hasInstruction && !systemInstruction) return null;

  return {
    contents,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: sanitizeGenerationConfig(body.generationConfig),
  };
}

/** Gemini's own error shape, so the AI SDK's error parsing still applies. */
function errorResponse(status, message, headers = {}) {
  return Response.json(
    { error: { code: status, message, status: "PROXY_REJECTED" } },
    { status, headers: { ...SECURITY_HEADERS, ...headers } }
  );
}

async function readJsonObject(request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > MAX_BODY_BYTES) return { status: 413 };

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return { status: 413 };
  }
  try {
    const parsed = JSON.parse(text);
    return isPlainObject(parsed) ? { body: parsed } : { status: 400 };
  } catch {
    return { status: 400 };
  }
}

function upstreamUrlFor({ model, method }) {
  const url = new URL(`${GEMINI_MODELS_URL}/${model}:${method}`);
  if (method === STREAMING_METHOD) url.searchParams.set("alt", "sse");
  return url;
}

export function createGeminiProxy({
  apiKey,
  allowedOrigins,
  fetchImpl = fetch,
  logError = console.error,
  upstreamTimeoutMs = UPSTREAM_TIMEOUT_MS,
}) {
  const isAllowedOrigin = createOriginMatcher(allowedOrigins);
  const corsFor = (origin) => ({
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  });

  function OPTIONS(request) {
    const origin = request.headers.get("origin");
    if (!isAllowedOrigin(origin)) {
      return new Response(null, { status: 403, headers: SECURITY_HEADERS });
    }
    return new Response(null, {
      status: 204,
      headers: {
        ...SECURITY_HEADERS,
        ...corsFor(origin),
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          request.headers.get("access-control-request-headers") ??
          "content-type",
        "Access-Control-Max-Age": PREFLIGHT_MAX_AGE_SECONDS,
      },
    });
  }

  async function toClientResponse(upstream, cors) {
    if (!upstream.ok && !PASSTHROUGH_ERROR_STATUSES.has(upstream.status)) {
      const detail = (await upstream.text()).slice(0, MAX_LOGGED_ERROR_CHARS);
      logError(`[assistant-proxy] Gemini returned ${upstream.status}`, detail);
      return errorResponse(502, "The assistant service is unavailable.", cors);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...SECURITY_HEADERS,
        ...cors,
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  }

  async function forward(target, body, cors, clientSignal) {
    try {
      const upstream = await fetchImpl(upstreamUrlFor(target), {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.any([
          clientSignal,
          AbortSignal.timeout(upstreamTimeoutMs),
        ]),
      });
      return await toClientResponse(upstream, cors);
    } catch (error) {
      logError("[assistant-proxy] Gemini request failed", error);
      return errorResponse(502, "The assistant service is unreachable.", cors);
    }
  }

  async function POST(request) {
    const origin = request.headers.get("origin");
    if (!isAllowedOrigin(origin)) {
      return errorResponse(403, "This origin may not use the assistant.");
    }
    const cors = corsFor(origin);

    if (!apiKey) {
      logError("[assistant-proxy] GOOGLE_GENERATIVE_AI_API_KEY is not set");
      return errorResponse(503, "The assistant is not configured.", cors);
    }

    const target = parseTarget(new URL(request.url).pathname);
    if (!target) return errorResponse(404, "Unsupported model or method.", cors);

    const { body, status } = await readJsonObject(request);
    if (!body) return errorResponse(status, "Invalid request body.", cors);

    const sanitized = sanitizeRequestBody(body);
    if (!sanitized) {
      return errorResponse(400, "Only text messages are supported.", cors);
    }

    return forward(target, sanitized, cors, request.signal);
  }

  return { OPTIONS, POST };
}
