import { describe, expect, test } from "vitest";
import { fixtureImage } from "@/test/book-fixture";
import { PAGE_BUDGET, pageBudgetViolations, proseWordCount } from "./budget";
import type { BookPage } from "./types";

function words(count: number): string {
  return Array.from({ length: count }, (_, i) => `w${i}`).join(" ");
}

describe("proseWordCount", () => {
  test("counts body, list, note and callout words but not kickers or headings", () => {
    const page: BookPage = {
      id: "p",
      blocks: [
        { kind: "kicker", text: "Field notes" },
        { kind: "heading", text: "A heading with words" },
        { kind: "body", paragraphs: ["one two", "three"] },
        { kind: "list", items: ["four five"] },
        { kind: "note", text: "six" },
        { kind: "callout", label: "Label", text: "seven eight" },
      ],
    };

    expect(proseWordCount(page)).toBe(8);
  });
});

describe("pageBudgetViolations", () => {
  test("accepts a page within budget", () => {
    const page: BookPage = {
      id: "ok",
      blocks: [
        { kind: "heading", text: "Short heading" },
        { kind: "body", paragraphs: [words(40)] },
        { kind: "image", image: fixtureImage("ok") },
      ],
    };

    expect(pageBudgetViolations(page)).toEqual([]);
  });

  test("allows more prose on a page without media", () => {
    const page: BookPage = { id: "text", blocks: [{ kind: "body", paragraphs: [words(90)] }] };

    expect(pageBudgetViolations(page)).toEqual([]);
  });

  test("flags too much prose next to an image", () => {
    const page: BookPage = {
      id: "wordy",
      blocks: [
        { kind: "body", paragraphs: [words(PAGE_BUDGET.proseWordsWithMedia + 1)] },
        { kind: "image", image: fixtureImage("wordy") },
      ],
    };

    expect(pageBudgetViolations(page)).toEqual([`wordy: 51 prose words (max ${PAGE_BUDGET.proseWordsWithMedia})`]);
  });

  test("flags long headings, long notes, long lists and crowded pages", () => {
    const page: BookPage = {
      id: "busy",
      blocks: [
        { kind: "heading", text: "x".repeat(PAGE_BUDGET.headingChars + 1) },
        { kind: "note", text: "y".repeat(PAGE_BUDGET.noteChars + 1) },
        { kind: "list", items: ["a", "b", "c", "d", "e", "f"] },
        { kind: "list", items: [words(PAGE_BUDGET.listItemWords + 1)] },
        { kind: "image", image: fixtureImage("a") },
        { kind: "image", image: fixtureImage("b") },
        { kind: "screens", images: [fixtureImage("c")] },
      ],
    };

    expect(pageBudgetViolations(page)).toEqual([
      "busy: 7 blocks (max 6)",
      "busy: 3 media blocks (max 2)",
      "busy: heading longer than 48 characters",
      "busy: note longer than 110 characters",
      "busy: list with 6 items (max 5)",
      "busy: list item longer than 14 words",
    ]);
  });
});
