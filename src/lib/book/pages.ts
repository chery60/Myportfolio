import type { Block, BookLayout, FlatPage, ProjectBook, TurnDirection } from "./types";

/** Below this frame width the book shows one page at a time. Mirrored in project-book.module.css. */
export const SPREAD_MIN_FRAME_WIDTH = 720;

const PAGES_PER_SPREAD = 2;

export function flattenPages(book: ProjectBook): readonly FlatPage[] {
  return book.spreads.flatMap((spread, spreadIndex) => [
    { index: spreadIndex * PAGES_PER_SPREAD, spreadIndex, side: "left" as const, page: spread.left, spread },
    { index: spreadIndex * PAGES_PER_SPREAD + 1, spreadIndex, side: "right" as const, page: spread.right, spread },
  ]);
}

export function spreadIndexOf(page: number): number {
  return Math.floor(page / PAGES_PER_SPREAD);
}

export function layoutForWidth(frameWidth: number): BookLayout {
  return frameWidth >= SPREAD_MIN_FRAME_WIDTH ? "spread" : "single";
}

export function visiblePageIndices(page: number, layout: BookLayout): readonly number[] {
  if (layout === "single") {
    return [page];
  }
  const left = spreadIndexOf(page) * PAGES_PER_SPREAD;
  return [left, left + 1];
}

/** The page a turn in `dir` lands on, or null when the book has no page there. */
export function stepTarget(page: number, dir: TurnDirection, layout: BookLayout, total: number): number | null {
  const delta = dir === "next" ? 1 : -1;
  const target =
    layout === "single" ? page + delta : (spreadIndexOf(page) + delta) * PAGES_PER_SPREAD;
  return target >= 0 && target < total ? target : null;
}

/** Where "End" lands: the last spread opens on its left page; single layout shows the final page. */
export function lastViewPage(layout: BookLayout, total: number): number {
  return layout === "spread" ? Math.max(total - PAGES_PER_SPREAD, 0) : total - 1;
}

export function positionLabel(book: ProjectBook, page: number, layout: BookLayout): string {
  const spreadIndex = spreadIndexOf(page);
  const title = book.spreads[spreadIndex]?.title ?? "";
  if (layout === "single") {
    return `Page ${page + 1} of ${book.spreads.length * PAGES_PER_SPREAD}: ${title}`;
  }
  return `Spread ${spreadIndex + 1} of ${book.spreads.length}: ${title}`;
}

function blockImageSrcs(block: Block): readonly string[] {
  if (block.kind === "image") {
    return [block.image.src];
  }
  if (block.kind === "screens") {
    return block.images.map((image) => image.src);
  }
  return [];
}

/** Image URLs on the views one turn away, so they can be decoded before the reader gets there. */
export function neighbourImageSrcs(book: ProjectBook, page: number, layout: BookLayout): readonly string[] {
  const pages = flattenPages(book);
  const neighbourPages =
    layout === "single"
      ? [page - 1, page + 1]
      : [-1, 1].flatMap((delta) => visiblePageIndices((spreadIndexOf(page) + delta) * PAGES_PER_SPREAD, "spread"));
  return neighbourPages
    .filter((index) => index >= 0 && index < pages.length)
    .flatMap((index) => pages[index].page.blocks.flatMap(blockImageSrcs));
}
