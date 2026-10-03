import { describe, expect, test } from "vitest";
import { FIXTURE_BOOK } from "@/test/book-fixture";
import {
  SPREAD_MIN_FRAME_WIDTH,
  flattenPages,
  lastViewPage,
  layoutForWidth,
  neighbourImageSrcs,
  positionLabel,
  spreadIndexOf,
  stepTarget,
  visiblePageIndices,
} from "./pages";

describe("flattenPages", () => {
  test("turns each spread into a left page then a right page", () => {
    const pages = flattenPages(FIXTURE_BOOK);

    expect(pages.map((p) => p.page.id)).toEqual([
      "s1-left",
      "s1-right",
      "s2-left",
      "s2-right",
      "s3-left",
      "s3-right",
    ]);
  });

  test("records index, spread index and side for every page", () => {
    const pages = flattenPages(FIXTURE_BOOK);

    expect(pages[3]).toMatchObject({ index: 3, spreadIndex: 1, side: "right" });
    expect(pages[3].spread.id).toBe("s2");
  });
});

describe("spreadIndexOf", () => {
  test("maps both pages of a spread to that spread", () => {
    expect([0, 1, 2, 3, 6, 7].map(spreadIndexOf)).toEqual([0, 0, 1, 1, 3, 3]);
  });
});

describe("layoutForWidth", () => {
  test("uses one page at a time below the spread threshold", () => {
    expect(layoutForWidth(SPREAD_MIN_FRAME_WIDTH - 1)).toBe("single");
    expect(layoutForWidth(390)).toBe("single");
  });

  test("uses two-page spreads at and above the threshold", () => {
    expect(layoutForWidth(SPREAD_MIN_FRAME_WIDTH)).toBe("spread");
    expect(layoutForWidth(960)).toBe("spread");
  });
});

describe("visiblePageIndices", () => {
  test("shows both pages of the current spread in spread layout", () => {
    expect(visiblePageIndices(0, "spread")).toEqual([0, 1]);
    expect(visiblePageIndices(3, "spread")).toEqual([2, 3]);
  });

  test("shows only the current page in single layout", () => {
    expect(visiblePageIndices(3, "single")).toEqual([3]);
  });
});

describe("stepTarget", () => {
  const total = 6;

  test("moves a whole spread at a time in spread layout, landing on a left page", () => {
    expect(stepTarget(0, "next", "spread", total)).toBe(2);
    expect(stepTarget(3, "next", "spread", total)).toBe(4);
    expect(stepTarget(3, "prev", "spread", total)).toBe(0);
  });

  test("moves one page at a time in single layout", () => {
    expect(stepTarget(0, "next", "single", total)).toBe(1);
    expect(stepTarget(3, "prev", "single", total)).toBe(2);
  });

  test("returns null past either end", () => {
    expect(stepTarget(0, "prev", "spread", total)).toBeNull();
    expect(stepTarget(4, "next", "spread", total)).toBeNull();
    expect(stepTarget(5, "next", "spread", total)).toBeNull();
    expect(stepTarget(0, "prev", "single", total)).toBeNull();
    expect(stepTarget(5, "next", "single", total)).toBeNull();
  });
});

describe("lastViewPage", () => {
  test("is the left page of the last spread in spread layout", () => {
    expect(lastViewPage("spread", 6)).toBe(4);
  });

  test("is the very last page in single layout", () => {
    expect(lastViewPage("single", 6)).toBe(5);
  });
});

describe("positionLabel", () => {
  test("names the spread in spread layout", () => {
    expect(positionLabel(FIXTURE_BOOK, 2, "spread")).toBe("Spread 2 of 3: Who's ordering");
  });

  test("names the page in single layout", () => {
    expect(positionLabel(FIXTURE_BOOK, 3, "single")).toBe("Page 4 of 6: Who's ordering");
  });
});

describe("neighbourImageSrcs", () => {
  test("lists images on the spreads either side in spread layout", () => {
    expect(neighbourImageSrcs(FIXTURE_BOOK, 2, "spread")).toEqual([
      "/fixture/s1-right.png",
      "/fixture/s3-right.png",
    ]);
  });

  test("lists images on the pages either side in single layout", () => {
    expect(neighbourImageSrcs(FIXTURE_BOOK, 2, "single")).toEqual(["/fixture/s1-right.png", "/fixture/s2-right.png"]);
  });

  test("includes every image in a screens block", () => {
    const book = {
      ...FIXTURE_BOOK,
      spreads: [
        FIXTURE_BOOK.spreads[0],
        {
          ...FIXTURE_BOOK.spreads[1],
          left: {
            id: "screens",
            blocks: [
              {
                kind: "screens" as const,
                images: [
                  { src: "/a.png" as const, alt: "a", width: 1, height: 1 },
                  { src: "/b.png" as const, alt: "b", width: 1, height: 1 },
                ],
              },
            ],
          },
        },
      ],
    };

    expect(neighbourImageSrcs(book, 0, "spread")).toEqual(["/a.png", "/b.png", "/fixture/s2-right.png"]);
  });
});
