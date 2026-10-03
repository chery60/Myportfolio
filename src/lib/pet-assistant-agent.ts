"use client";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ToolLoopAgent } from "ai";

/** The deployed `assistant-proxy/` Vercel function. */
const DEFAULT_PROXY_BASE_URL =
  "https://myportfolio-assistant.vercel.app/api/v1beta";

/**
 * This runs in the browser, but it never holds the Gemini key.
 *
 * The site is a static export on GitHub Pages, so it cannot keep a secret.
 * Requests go instead to a small proxy (`assistant-proxy/`) that adds the key
 * server-side and forwards only this model, a capped reply length, and requests
 * from this site's origin — see README.
 *
 * Override with NEXT_PUBLIC_ASSISTANT_PROXY_URL, or set it empty to build with
 * the assistant offline. Must be written as a literal `process.env.NEXT_PUBLIC_*`
 * member expression: Next replaces it at build time by textual substitution, so
 * destructuring or dynamic lookup would silently leave it undefined.
 */
const PROXY_BASE_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_PROXY_URL ?? DEFAULT_PROXY_BASE_URL;

/** The SDK refuses to run without a key; the proxy discards it and uses its own. */
const PROXY_PLACEHOLDER_KEY = "held-by-proxy";

/**
 * Free of charge on the Gemini free tier, and the fastest tier available.
 * The proxy only forwards models on its allowlist, so change both together.
 */
const MODEL_ID = "gemini-3.5-flash-lite";

/**
 * Ceiling on a single reply. The prompt also asks for under 120 words. The
 * proxy enforces the same ceiling, since the browser is not trusted.
 */
const MAX_OUTPUT_TOKENS = 400;

export const isAssistantConfigured = PROXY_BASE_URL.length > 0;

export function createPetAssistantAgent(instructions: string) {
  const google = createGoogleGenerativeAI({
    baseURL: PROXY_BASE_URL,
    apiKey: PROXY_PLACEHOLDER_KEY,
  });

  return new ToolLoopAgent({
    model: google(MODEL_ID),
    // `instructions`, not `system` — that is the field name on ToolLoopAgent.
    instructions,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.4,
    // A free-tier 429 should fail fast and show a friendly message rather than
    // retry-storm against a quota that is already exhausted.
    maxRetries: 1,
    providerOptions: {
      google: {
        // Thinking tokens come out of `maxOutputTokens` and buy nothing for
        // short factual answers drawn from a prompt that already contains
        // every fact.
        //
        // Note: `thinkingBudget: 0` is rejected outright by the Gemini 3.x
        // models (HTTP 400, INVALID_ARGUMENT) — they expect a level, not a
        // budget of zero. `minimal` is the modern equivalent.
        thinkingConfig: { thinkingLevel: "minimal", includeThoughts: false },
      },
    },
  });
}
