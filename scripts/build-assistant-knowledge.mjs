/**
 * Generates the assistant's case-study knowledge as a plain TypeScript module.
 *
 * Why a build step instead of importing `content-collections` directly: that
 * package hands back a `mdx` field holding *compiled MDX JavaScript* alongside
 * the raw `content`. Importing it from a client component would drag all five
 * compiled bodies into the browser bundle — large, and useless to a language
 * model. This reads the source files and emits prose only.
 *
 * Run via the `predev` / `prebuild` npm lifecycle. The output is committed so
 * builds stay reproducible without running the script first.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = "content";
const OUT_FILE = "src/lib/assistant-knowledge.generated.ts";

/**
 * Case studies run long. The whole pack is re-sent on every single turn (the
 * Gemini free tier has no context caching), so each one is capped at roughly
 * its first 7k characters — the framing and opening sections carry the story.
 */
const MAX_CHARS_PER_STUDY = 7000;

function readFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: raw };

  const data = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: raw.slice(match[0].length) };
}

function sanitize(body) {
  return body
    .replace(/^export\s+const\s+[\s\S]*?$/gm, "") // export const withBasePath = ...
    .replace(/^import\s+.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // markdown images
    .replace(/<\/?[A-Za-z][^>]*>/g, "") // all JSX/HTML tags, incl. <ProjectVideo />
    .replace(/\{[^{}\n]*\}/g, "") // leftover JSX expressions
    .replace(/\[([^\]]+)\]\((?:https?:)?[^)]*\)/g, "$1") // links -> their text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastBreak = cut.lastIndexOf("\n\n");
  return (lastBreak > limit * 0.6 ? cut.slice(0, lastBreak) : cut).trimEnd();
}

const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".mdx")).sort();

const studies = [];
for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
  const { data, body } = readFrontmatter(raw);
  studies.push({
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? "",
    body: truncate(sanitize(body), MAX_CHARS_PER_STUDY),
  });
}

const entries = studies
  .map(
    (s) => `  ${JSON.stringify(s.slug)}: {
    title: ${JSON.stringify(s.title)},
    summary: ${JSON.stringify(s.summary)},
    body: ${JSON.stringify(s.body)},
  },`
  )
  .join("\n");

const out = `// GENERATED FILE — do not edit by hand.
// Run \`node scripts/build-assistant-knowledge.mjs\` (or any \`pnpm dev\`/\`pnpm build\`)
// to regenerate from content/*.mdx.

export interface CaseStudyKnowledge {
  title: string;
  summary: string;
  body: string;
}

export const CASE_STUDIES: Record<string, CaseStudyKnowledge> = {
${entries}
};

export const CASE_STUDY_SLUGS = Object.keys(CASE_STUDIES);
`;

await writeFile(OUT_FILE, out, "utf8");

const chars = studies.reduce((n, s) => n + s.body.length, 0);
console.log(
  `[assistant-knowledge] ${studies.length} case studies, ${chars.toLocaleString()} chars (~${Math.round(chars / 4).toLocaleString()} tokens) -> ${OUT_FILE}`
);
