/**
 * How much a single page may hold. A page is a fixed-size, landscape piece of
 * paper (about 1.13 : 1, the proportions of the reference sketchbook), not a
 * scrolling column, so its copy has to fit at the smallest phone width: a
 * heading, one picture and a handwritten line or two.
 * The data tests run every book through `pageBudgetViolations`.
 */
import type { Block, BookPage } from "./types";

export const PAGE_BUDGET = {
  proseWordsWithMedia: 24,
  proseWordsTextOnly: 48,
  headingChars: 34,
  noteChars: 80,
  listItems: 4,
  listItemWords: 9,
  mediaBlocks: 1,
  blocks: 5,
} as const;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function blockProse(block: Block): readonly string[] {
  switch (block.kind) {
    case "body":
      return block.paragraphs;
    case "list":
      return block.items;
    case "note":
    case "callout":
      return [block.text];
    default:
      return [];
  }
}

function isMedia(block: Block): boolean {
  return block.kind === "image" || block.kind === "screens";
}

export function proseWordCount(page: BookPage): number {
  return page.blocks.flatMap(blockProse).reduce((total, text) => total + wordCount(text), 0);
}

export function pageBudgetViolations(page: BookPage): readonly string[] {
  const { blocks } = page;
  const mediaCount = blocks.filter(isMedia).length;
  const proseLimit = mediaCount > 0 ? PAGE_BUDGET.proseWordsWithMedia : PAGE_BUDGET.proseWordsTextOnly;
  const prose = proseWordCount(page);
  const lists = blocks.flatMap((block) => (block.kind === "list" ? [block] : []));

  const checks: ReadonlyArray<[boolean, string]> = [
    [blocks.length > PAGE_BUDGET.blocks, `${blocks.length} blocks (max ${PAGE_BUDGET.blocks})`],
    [mediaCount > PAGE_BUDGET.mediaBlocks, `${mediaCount} media blocks (max ${PAGE_BUDGET.mediaBlocks})`],
    [prose > proseLimit, `${prose} prose words (max ${proseLimit})`],
    [
      blocks.some((b) => b.kind === "heading" && b.text.length > PAGE_BUDGET.headingChars),
      `heading longer than ${PAGE_BUDGET.headingChars} characters`,
    ],
    [
      blocks.some((b) => b.kind === "note" && b.text.length > PAGE_BUDGET.noteChars),
      `note longer than ${PAGE_BUDGET.noteChars} characters`,
    ],
    [
      lists.some((list) => list.items.length > PAGE_BUDGET.listItems),
      `list with ${Math.max(0, ...lists.map((l) => l.items.length))} items (max ${PAGE_BUDGET.listItems})`,
    ],
    [
      lists.some((list) => list.items.some((item) => wordCount(item) > PAGE_BUDGET.listItemWords)),
      `list item longer than ${PAGE_BUDGET.listItemWords} words`,
    ],
  ];

  return checks.filter(([failed]) => failed).map(([, message]) => `${page.id}: ${message}`);
}
