/**
 * Guards the authored book content: every asset ships, every page fits, every
 * image is described. Runs against every registered book.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { pageBudgetViolations } from "@/lib/book/budget";
import { flattenPages } from "@/lib/book/pages";
import type { Block, BookImage, BookLink, BookPage, ProjectBook } from "@/lib/book/types";
import { getProjectBook, projectBookSlugs } from "./index";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const CONTENT_DIR = path.join(process.cwd(), "content");
const MAX_ALT_LENGTH = 140;
const PNG_SIGNATURE = "89504e470d0a1a0a";

function books(): ProjectBook[] {
  return projectBookSlugs().map((slug) => {
    const book = getProjectBook(slug);
    if (!book) {
      throw new Error(`registered slug without a book: ${slug}`);
    }
    return book;
  });
}

function blockImages(block: Block): readonly BookImage[] {
  if (block.kind === "image") {
    return [block.image];
  }
  return block.kind === "screens" ? block.images : [];
}

function imagesOf(book: ProjectBook): readonly BookImage[] {
  return flattenPages(book).flatMap(({ page }) => page.blocks.flatMap(blockImages));
}

function linksOn(page: BookPage): readonly BookLink[] {
  return page.blocks.flatMap((block) => (block.kind === "callout" ? (block.links ?? []) : []));
}

/** The case study's walkthrough video id, from its MDX front matter. */
function walkthroughIdOf(slug: string): string | undefined {
  const source = readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  return /^walkthroughId:\s*"([^"]+)"/m.exec(source)?.[1];
}

/** Reads width and height from a PNG's IHDR chunk. */
function pngSize(file: string): { width: number; height: number } | null {
  const header = readFileSync(file).subarray(0, 24);
  if (header.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    return null;
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

describe.each(books().map((book) => [book.slug, book] as const))("book %s", (_slug, book) => {
  test("has a title and at least one spread", () => {
    expect(book.title.trim()).not.toBe("");
    expect(book.spreads.length).toBeGreaterThan(0);
  });

  test("uses unique spread and page ids", () => {
    const ids = book.spreads.flatMap((spread) => [spread.id, spread.left.id, spread.right.id]);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("gives every spread a title and a caption", () => {
    for (const spread of book.spreads) {
      expect(spread.title.trim(), spread.id).not.toBe("");
      expect(spread.caption.trim(), spread.id).not.toBe("");
    }
  });

  test("keeps every page within the page budget", () => {
    const violations = flattenPages(book).flatMap(({ page }) => pageBudgetViolations(page));

    expect(violations).toEqual([]);
  });

  test("ships every image from public/, never from working folders", () => {
    for (const image of imagesOf(book)) {
      expect(image.src.startsWith("/brag-output"), image.src).toBe(false);
      expect(existsSync(path.join(PUBLIC_DIR, image.src)), image.src).toBe(true);
    }
  });

  test("declares the real pixel size of every PNG", () => {
    for (const image of imagesOf(book)) {
      const size = pngSize(path.join(PUBLIC_DIR, image.src));
      if (size) {
        expect({ src: image.src, width: image.width, height: image.height }).toEqual({ src: image.src, ...size });
      }
    }
  });

  test("describes every image", () => {
    for (const image of imagesOf(book)) {
      expect(image.alt.trim().length, image.src).toBeGreaterThan(0);
      expect(image.alt.length, image.src).toBeLessThanOrEqual(MAX_ALT_LENGTH);
    }
  });

  test("links only to site paths, anchors or https", () => {
    const links = flattenPages(book).flatMap(({ page }) => linksOn(page));
    for (const link of links) {
      expect(link.href, link.label).toMatch(/^(\/|#|https:\/\/)/);
    }
  });

  test("tells the project in six to ten spreads, opening on the problem", () => {
    expect(book.spreads.length).toBeGreaterThanOrEqual(6);
    expect(book.spreads.length).toBeLessThanOrEqual(10);
    expect(book.spreads[0].title).toMatch(/problem/i);
  });

  test("ends on its own walkthrough and the full case study", () => {
    const last = book.spreads[book.spreads.length - 1];
    const hrefs = [...linksOn(last.left), ...linksOn(last.right)].map((link) => link.href);
    const walkthroughId = walkthroughIdOf(book.slug);

    expect(walkthroughId, "walkthroughId in the case study").toBeDefined();
    expect(hrefs).toContain(`https://www.youtube.com/watch?v=${walkthroughId}`);
    expect(hrefs).toContain("#case-study");
  });
});

describe("registered books", () => {
  test.each(["ai-unit-planning", "symphony-kiosk", "companies-platform", "user-management", "educator-platform"])("include %s", (slug) => {
    expect(projectBookSlugs()).toContain(slug);
  });
});
