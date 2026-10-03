import { describe, expect, test } from "vitest";
import {
  CURL_AMPLITUDE,
  MAX_SHADE,
  STRIP_COUNT,
  computeCurl,
  curlTransforms,
  dragProgress,
  pxVelocityToProgress,
  releaseDecision,
} from "./curl-geometry";

describe("computeCurl", () => {
  test("is flat and unshaded before the turn starts", () => {
    const frame = computeCurl(0);

    expect(frame.rootAngle).toBe(0);
    expect(frame.stepAngle).toBe(0);
    expect(frame.shade).toBe(0);
    expect(frame.strips).toHaveLength(STRIP_COUNT);
    expect(frame.strips.every((s) => s.front[0] === 0 && s.front[1] === 0 && s.glow === 0)).toBe(true);
  });

  test("lies flat on the other side when the turn ends", () => {
    const frame = computeCurl(1);

    expect(frame.rootAngle).toBeCloseTo(Math.PI, 10);
    expect(frame.stepAngle).toBeCloseTo(0, 10);
    expect(frame.shade).toBeCloseTo(0, 10);
  });

  test("bends most, and is darkest, halfway through", () => {
    const frame = computeCurl(0.5);

    expect(frame.rootAngle).toBeCloseTo(Math.PI / 2 + CURL_AMPLITUDE, 10);
    expect(frame.stepAngle).toBeCloseTo((2 * CURL_AMPLITUDE) / STRIP_COUNT, 10);
    expect(frame.shade).toBeCloseTo(1, 10);
  });

  test("keeps the spine edge and the outer edge of the leaf between flat and flipped", () => {
    for (let i = 0; i <= 100; i++) {
      const frame = computeCurl(i / 100);
      const tipAngle = frame.rootAngle - STRIP_COUNT * frame.stepAngle;

      expect(frame.rootAngle).toBeGreaterThanOrEqual(0);
      expect(frame.rootAngle).toBeLessThanOrEqual(Math.PI + 1e-9);
      expect(tipAngle).toBeGreaterThanOrEqual(-1e-9);
      expect(tipAngle).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });

  test("clamps progress outside 0..1", () => {
    expect(computeCurl(-0.5)).toEqual(computeCurl(0));
    expect(computeCurl(1.5)).toEqual(computeCurl(1));
  });

  test("darkens strips that face away from the reader, never beyond the maximum", () => {
    const frame = computeCurl(0.5);
    const shades = frame.strips.flatMap((s) => [...s.front, ...s.back]);

    expect(Math.max(...shades)).toBeGreaterThan(0);
    expect(Math.max(...shades)).toBeLessThanOrEqual(MAX_SHADE);
  });

  test("mirrors the gradient on the back of each strip", () => {
    for (const strip of computeCurl(0.3).strips) {
      expect(strip.back).toEqual([strip.front[1], strip.front[0]]);
    }
  });

  test("accepts a different strip count", () => {
    const frame = computeCurl(0.5, 4);

    expect(frame.strips).toHaveLength(4);
    expect(frame.stepAngle).toBeCloseTo((2 * CURL_AMPLITUDE) / 4, 10);
  });
});

describe("curlTransforms", () => {
  test("swings the root strip toward the reader and bends each nested strip back", () => {
    const transforms = curlTransforms(computeCurl(0.5));

    expect(transforms.root).toBe(`rotateY(${(-(Math.PI / 2 + CURL_AMPLITUDE)).toFixed(4)}rad)`);
    expect(transforms.nested).toBe(`rotateY(${((2 * CURL_AMPLITUDE) / STRIP_COUNT).toFixed(4)}rad)`);
  });
});

describe("dragProgress", () => {
  const span = 620;

  test("turning forward follows a drag to the left", () => {
    expect(dragProgress(-310, span, "next")).toBeCloseTo(0.5);
    expect(dragProgress(40, span, "next")).toBe(0);
    expect(dragProgress(-2000, span, "next")).toBe(1);
  });

  test("turning back starts flipped and follows a drag to the right", () => {
    expect(dragProgress(310, span, "prev")).toBeCloseTo(0.5);
    expect(dragProgress(-40, span, "prev")).toBe(1);
    expect(dragProgress(2000, span, "prev")).toBe(0);
  });
});

describe("pxVelocityToProgress", () => {
  test("converts horizontal pointer speed into progress per second", () => {
    expect(pxVelocityToProgress(-620, 620)).toBeCloseTo(1);
    expect(pxVelocityToProgress(310, 620)).toBeCloseTo(-0.5);
  });
});

describe("releaseDecision", () => {
  test("a press that barely moved is a tap", () => {
    expect(releaseDecision({ moved: 3, progress: 0, velocity: 0, dir: "next" })).toBe("tap");
  });

  test("commits a forward drag past the commit point", () => {
    expect(releaseDecision({ moved: 200, progress: 0.5, velocity: 0, dir: "next" })).toBe("commit");
  });

  test("cancels a forward drag released early and slowly", () => {
    expect(releaseDecision({ moved: 120, progress: 0.3, velocity: 0, dir: "next" })).toBe("cancel");
  });

  test("commits a short, fast flick", () => {
    expect(releaseDecision({ moved: 60, progress: 0.2, velocity: 1.5, dir: "next" })).toBe("commit");
    expect(releaseDecision({ moved: 60, progress: 0.8, velocity: -1.5, dir: "prev" })).toBe("commit");
  });

  test("measures progress from the other side when turning back", () => {
    expect(releaseDecision({ moved: 200, progress: 0.5, velocity: 0, dir: "prev" })).toBe("commit");
    expect(releaseDecision({ moved: 120, progress: 0.7, velocity: 0, dir: "prev" })).toBe("cancel");
  });

  test("cancels when the reader throws the page back", () => {
    expect(releaseDecision({ moved: 200, progress: 0.6, velocity: -1.5, dir: "next" })).toBe("cancel");
  });
});
