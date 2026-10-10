import { describe, expect, test } from "vitest";
import {
  GLASS_MAX_DIAMETER,
  GLASS_MIN_DIAMETER,
  LOUPE_MAGNIFICATION,
  clampGlassCenter,
  fromNormalized,
  glassDiameter,
  glassMetrics,
  lensOffset,
  lensOverhangRight,
  loupeContentTransform,
  nudgeCenter,
  parkedCenter,
  toNormalized,
} from "./loupe-geometry";

const STAGE = { width: 800, height: 533 };
/** Plenty of room right of the book: the handle can hang off it freely. */
const ROOMY = glassMetrics(STAGE, 400);

describe("glassDiameter", () => {
  test("scales with the stage between a minimum and a maximum", () => {
    expect(glassDiameter(300)).toBe(GLASS_MIN_DIAMETER);
    expect(glassDiameter(800)).toBeCloseTo(188);
    expect(glassDiameter(2000)).toBe(GLASS_MAX_DIAMETER);
  });
});

describe("glassMetrics", () => {
  test("lets the glass hang a little below the book, as it does at rest", () => {
    // Diameter 188; it may drop 0.08 × 188 = 15.04px past the bottom edge.
    expect(ROOMY.diameter).toBeCloseTo(188);
    expect(ROOMY.maxX).toBe(800);
    expect(ROOMY.maxY).toBeCloseTo(548.04);
  });

  test("keeps the handle inside the frame when the book is near its right edge", () => {
    // The handle reaches 0.9 × 188 = 169.2px right of the centre, plus an 8px gap.
    expect(glassMetrics(STAGE, 30).maxX).toBeCloseTo(800 + 30 - 169.2 - 8);
  });

  test("treats a book already past the frame edge as having no room", () => {
    expect(glassMetrics(STAGE, -50).maxX).toBeCloseTo(800 - 169.2 - 8);
  });

  test("never lets the glass leave the book's left edge, however tight", () => {
    expect(glassMetrics({ width: 100, height: 100 }, 0).maxX).toBe(0);
  });
});

describe("clampGlassCenter", () => {
  test("keeps the centre of the glass over the book", () => {
    const clamped = clampGlassCenter({ x: -40, y: 900 }, ROOMY);

    expect(clamped.x).toBe(0);
    expect(clamped.y).toBeCloseTo(548.04);
    expect(clampGlassCenter({ x: 120, y: 60 }, ROOMY)).toEqual({ x: 120, y: 60 });
  });
});

describe("parkedCenter", () => {
  test("rests the glass off the bottom-right corner, a third of it in from the edge", () => {
    const parked = parkedCenter(ROOMY);

    expect(parked.x).toBeCloseTo(800 - 188 * 0.33);
    expect(parked.y).toBeCloseTo(533 + 188 * 0.08);
  });

  test("rests further in when the handle would otherwise leave the frame", () => {
    expect(parkedCenter(glassMetrics(STAGE, 30)).x).toBeCloseTo(800 + 30 - 169.2 - 8);
  });
});

describe("nudgeCenter", () => {
  test("moves by a small fraction of the stage width per key press", () => {
    const start = { x: 400, y: 200 };

    expect(nudgeCenter(start, "right", ROOMY)).toEqual({ x: 416, y: 200 });
    expect(nudgeCenter(start, "left", ROOMY)).toEqual({ x: 384, y: 200 });
    expect(nudgeCenter(start, "up", ROOMY)).toEqual({ x: 400, y: 184 });
    expect(nudgeCenter(start, "down", ROOMY)).toEqual({ x: 400, y: 216 });
  });

  test("moves four times as far with Shift held", () => {
    expect(nudgeCenter({ x: 400, y: 200 }, "right", ROOMY, true)).toEqual({ x: 464, y: 200 });
  });

  test("stops at the edge of the book", () => {
    expect(nudgeCenter({ x: 795, y: 200 }, "right", ROOMY)).toEqual({ x: 800, y: 200 });
  });
});

describe("lensOverhangRight", () => {
  test("reaches past the book as far as the glass can", () => {
    // The centre may go to the right edge (800); the glass reaches its radius beyond.
    expect(lensOverhangRight(ROOMY)).toBeCloseTo(94);
  });

  test("stays inside the book when the glass cannot reach its edge", () => {
    // 652.8 + 94 = 746.8, short of the 800px edge.
    expect(lensOverhangRight(glassMetrics(STAGE, 30))).toBe(0);
  });
});

describe("lens maths", () => {
  test("keeps the point under the centre of the glass fixed while magnifying", () => {
    const centre = { x: 312, y: 145 };
    const offset = lensOffset(centre, LOUPE_MAGNIFICATION);

    expect(offset.x + LOUPE_MAGNIFICATION * centre.x).toBeCloseTo(centre.x);
    expect(offset.y + LOUPE_MAGNIFICATION * centre.y).toBeCloseTo(centre.y);
  });

  test("builds the CSS transform for the magnified layer", () => {
    expect(loupeContentTransform({ x: 100, y: 50 }, 2)).toBe("translate3d(-100px, -50px, 0) scale(2)");
  });
});

describe("normalised positions", () => {
  test("round-trip through the stage size", () => {
    const point = { x: 200, y: 400 };
    const normalised = toNormalized(point, STAGE);

    expect(normalised).toEqual({ x: 0.25, y: 400 / 533 });
    expect(fromNormalized(normalised, STAGE).x).toBeCloseTo(200);
    expect(fromNormalized(normalised, STAGE).y).toBeCloseTo(400);
  });

  test("treat an unmeasured stage as the origin", () => {
    expect(toNormalized({ x: 10, y: 10 }, { width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });
});
