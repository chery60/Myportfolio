<div align="center">
<img alt="Portfolio" src="https://github.com/dillionverma/portfolio/assets/16860528/57ffca81-3f0a-4425-b31d-094f61725455" width="90%">
</div>

# Portfolio [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdillionverma%2Fportfolio)

Built with next.js, [shadcn/ui](https://ui.shadcn.com/), and [magic ui](https://magicui.design/), deployed on Vercel.

# Features

- Setup only takes a few minutes by editing the [single config file](./src/data/resume.tsx)
- Built using Next.js 14, React, Typescript, Shadcn/UI, TailwindCSS, Framer Motion, Magic UI
- Includes a blog
- Responsive for different devices
- Optimized for Next.js and Vercel

# Getting Started Locally

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/dillionverma/portfolio
   ```

2. Move to the cloned directory

   ```bash
   cd portfolio
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the local Server:

   ```bash
   pnpm dev
   ```

5. Open the [Config file](./src/data/resume.tsx) and make changes

# License

Licensed under the [MIT license](https://github.com/dillionverma/portfolio/blob/main/LICENSE.md).

---

## Pet assistant

Clicking the pet in the corner opens a chat panel that answers questions about
Sai Charan, grounded in `src/data/resume.tsx` and the five case studies in
`content/`. The UI is built from [AI Elements](https://elements.ai-sdk.dev).

### How it is wired

This site is a **static export** on GitHub Pages, so there is no server and no
API route. The browser runs a `ToolLoopAgent` handed to the AI SDK's
`DirectChatTransport` (`src/lib/pet-assistant-agent.ts`), whose `baseURL` points
at a small proxy rather than at Google — see below. The heavy parts — `ai`, `@ai-sdk/google`, `streamdown` — are behind a
`next/dynamic` boundary and load only when the panel is first opened, so they
cost a visitor who never opens it nothing.

The assistant's knowledge is generated at build time by
`scripts/build-assistant-knowledge.mjs` (wired to `predev`/`prebuild`), which
strips MDX/JSX out of `content/*.mdx` and emits plain prose. This keeps the
*compiled* MDX that `content-collections` produces out of the browser bundle.

### The API key stays on a server

A static site cannot keep a secret: anything the browser uses, a visitor can
read. So the Gemini key lives in `assistant-proxy/`, a separate Vercel project
with one function at `/api/v1beta/models/{model}:{method}`. It adds the key
server-side and forwards only:

- requests whose `Origin` is `https://chery60.github.io` or `http://localhost:3000`
  (override with `ALLOWED_ORIGINS`),
- the `gemini-3.5-flash-lite` model, via `generateContent` or
  `streamGenerateContent`,
- the request fields the assistant sends, with `maxOutputTokens` clamped to 400
  and a single candidate, in bodies up to 128 KB.

A script can forge an `Origin` header, so the proxy only stops other *websites*
from borrowing it. The real spend ceiling is a **daily quota override** on the
Google Cloud project, and the key should be one used for nothing else and
restricted to the Generative Language API.

Deploying or rotating the proxy:

```bash
cd assistant-proxy
npm test                                                  # node:test, no deps
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production    # paste the key
vercel deploy --prod
```

The site uses the proxy URL in `src/lib/pet-assistant-agent.ts`. Override it
with `NEXT_PUBLIC_ASSISTANT_PROXY_URL`, or set that to an empty value to build
with the panel showing an "assistant is offline" message. See `.env.example`.

### Deploying the site

GitHub Pages serves the root of `main` (legacy "deploy from a branch" mode), so
the static export is committed next to the source:

```bash
GITHUB_PAGES=true npm run build   # writes out/
rm -rf _next                      # drop chunks from the previous build
rsync -a out/ ./                  # copy the export to the repo root
```

### Limits

Set in `src/lib/assistant-persona.ts` and `src/lib/pet-assistant-agent.ts`:
500 characters per message, 8 questions per conversation, 400 output tokens,
thinking disabled, one retry, and `gemini-3.5-flash-lite` (free tier). The
system prompt restricts the assistant to Sai Charan's work and instructs it to
treat visitor input as questions rather than instructions.

Free-tier usage is used by Google to improve their products, which is why the
panel header says "AI assistant · answers may be imperfect".
