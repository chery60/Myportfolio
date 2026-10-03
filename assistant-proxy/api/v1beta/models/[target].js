import {
  createGeminiProxy,
  parseAllowedOrigins,
} from "../../../lib/gemini-proxy.js";

/**
 * Serves `/api/v1beta/models/{model}:{method}`, the path the AI SDK builds from
 * its `baseURL`. Set GOOGLE_GENERATIVE_AI_API_KEY in the Vercel project; set
 * ALLOWED_ORIGINS only to override the defaults in lib/gemini-proxy.js.
 */
const proxy = createGeminiProxy({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
});

export function OPTIONS(request) {
  return proxy.OPTIONS(request);
}

export function POST(request) {
  return proxy.POST(request);
}
