import { describe, expect, test } from "vitest";
import {
  GLASS_MAX_DIAMETER,
  GLASS_MIN_DIAMETER,
  LOUPE_MAGNIFICATION,
  clampGlassCenter,
  fromNormalized,
  glassDiameter,
  lensOffset,
  loupeContentTransform,
  nudgeCenter,
  parkedCenter,
  toNormalized,
} from "./loupe-geometry";

const STAGE = { width: 800, height: 533 };

describe("glassDiameter", () => {
  test("scales with the stage between a minimum and a maximum", () => {
    expect(glassDiameter(300)).toBe(GLASS_MIN_DIAMETER);
    expect(glassDiameter(800)).toBeCloseTo(188);
    expect(glassDiameter(2000)).toBe(GLASS_MAX_DIAMETER);
  });
});

describe("clampGlassCenter", () => {
  test("keeps the centre of the glass over the book", () => {
    expect(clampGlassCenter({ x: -40, y: 900 }, STAGE)).toEqual({ x: 0, y: STAGE.height });
    expect(clampGlassCenter({ x: 120, y: 60 }, STAGE)).toEqual({ x: 120, y: 60 });
  });
});

describe("parkedCenter", () => {
  test("rests the glass in the bottom-right corner, fully on the book", () => {
    expect(parkedCenter(STAGE, 90)).toEqual({ x: 800 - 90 - 12, y: 533 - 90 - 12 });
  });

  test("still lands on the book when the glass is larger than the corner", () => {
    expect(parkedCenter({ width: 100, height: 100 }, 90)).toEqual({ x: 0, y: 0 });
  });
});

describe("nudgeCenter", () => {
  test("moves by a small fraction of the stage width per key press", () => {
    const start = { x: 400, y: 200 };

    expect(nudgeCenter(start, "right", STAGE)).toEqual({ x: 416, y: 200 });
    expect(nudgeCenter(start, "left", STAGE)).toEqual({ x: 384, y: 200 });
    expect(nudgeCenter(start, "up", STAGE)).toEqual({ x: 400, y: 184 });
    expect(nudgeCenter(start, "down", STAGE)).toEqual({ x: 400, y: 216 });
  });

  test("moves four times as far with Shift held", () => {
    expect(nudgeCenter({ x: 400, y: 200 }, "right", STAGE, true)).toEqual({ x: 464, y: 200 });
  });

  test("stops at the edge of the book", () => {
    expect(nudgeCenter({ x: 795, y: 200 }, "right", STAGE)).toEqual({ x: 800, y: 200 });
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
