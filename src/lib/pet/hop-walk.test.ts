import { describe, expect, test } from "vitest";
import {
  createHop,
  getHopGroundPosition,
  getHopPose,
  getHopTransforms,
  HOP_WALK_MAX_DISTANCE,
  shouldHopWalk,
  type HopStyle,
} from "./hop-walk";

const STYLE: HopStyle = { stride: 30, durationMs: 250, height: 10 };
const ARRIVAL = 14;

describe("createHop", () => {
  test("covers one stride toward a far target", () => {
    const hop = createHop({ x: 0, y: 0 }, { x: 100, y: 0 }, 1_000, STYLE);

    expect(hop.end).toEqual({ x: 30, y: 0 });
    expect(hop.startedAt).toBe(1_000);
    expect(hop.durationMs).toBe(250);
    expect(hop.direction).toBe(1);
  });

  test("lands exactly on a target closer than a stride", () => {
    const hop = createHop({ x: 10, y: 10 }, { x: 22, y: 26 }, 0, STYLE);

    expect(hop.end).toEqual({ x: 22, y: 26 });
  });

  test("keeps the stride along a diagonal", () => {
    const hop = createHop({ x: 0, y: 0 }, { x: 60, y: 80 }, 0, STYLE);

    expect(Math.hypot(hop.end.x, hop.end.y)).toBeCloseTo(30, 5);
  });

  test("faces left when the target is to the left", () => {
    const hop = createHop({ x: 50, y: 0 }, { x: 0, y: 0 }, 0, STYLE);

    expect(hop.direction).toBe(-1);
  });
});

describe("getHopGroundPosition", () => {
  const hop = createHop({ x: 0, y: 0 }, { x: 30, y: 0 }, 0, STYLE);

  test("stays put while crouching, before take-off", () => {
    expect(getHopGroundPosition(hop, 0.1)).toEqual({ x: 0, y: 0 });
  });

  test("travels while airborne", () => {
    const middle = getHopGroundPosition(hop, 0.5);

    expect(middle.x).toBeGreaterThan(5);
    expect(middle.x).toBeLessThan(25);
  });

  test("has arrived by the time it lands", () => {
    expect(getHopGroundPosition(hop, 0.9)).toEqual({ x: 30, y: 0 });
    expect(getHopGroundPosition(hop, 1)).toEqual({ x: 30, y: 0 });
  });
});

describe("getHopPose", () => {
  test("starts and ends on the ground at rest", () => {
    for (const progress of [0, 1]) {
      const pose = getHopPose(progress);
      expect(pose.lift).toBeCloseTo(0, 5);
      expect(pose.scaleX).toBeCloseTo(1, 5);
      expect(pose.scaleY).toBeCloseTo(1, 5);
    }
  });

  test("crouches before take-off (anticipation)", () => {
    const pose = getHopPose(0.15);

    expect(pose.lift).toBe(0);
    expect(pose.scaleY).toBeLessThan(0.95);
    expect(pose.scaleX).toBeGreaterThan(1.05);
  });

  test("peaks mid-air", () => {
    expect(getHopPose(0.5).lift).toBeCloseTo(1, 5);
  });

  test("squashes on landing", () => {
    const pose = getHopPose(0.925);

    expect(pose.lift).toBe(0);
    expect(pose.scaleY).toBeLessThan(0.92);
  });

  test("tips nose-up on the way up and nose-down on the way down", () => {
    expect(getHopPose(0.25).tilt).toBeLessThan(0);
    expect(getHopPose(0.8).tilt).toBeGreaterThan(0);
  });

  test("never jumps more than a little between neighbouring frames", () => {
    const FRAME = 1 / 60;
    for (let progress = 0; progress < 1; progress += FRAME) {
      const now = getHopPose(progress);
      const next = getHopPose(Math.min(1, progress + FRAME));
      expect(Math.abs(next.scaleY - now.scaleY)).toBeLessThan(0.08);
    }
  });
});

describe("getHopTransforms", () => {
  test("lifts the image while the shadow stays on the ground, smaller and lighter", () => {
    const transforms = getHopTransforms(getHopPose(0.5), STYLE.height);

    expect(transforms.image).toContain("translateY(-10.00px)");
    expect(transforms.shadow).toMatch(/^translateX\(-50%\) scale\(0\.\d+\)$/);
    expect(Number(transforms.shadowOpacity)).toBeLessThan(0.9);
  });
});

describe("shouldHopWalk", () => {
  test("hops for short moves only", () => {
    expect(shouldHopWalk(ARRIVAL, ARRIVAL, false)).toBe(false);
    expect(shouldHopWalk(80, ARRIVAL, false)).toBe(true);
    expect(shouldHopWalk(HOP_WALK_MAX_DISTANCE, ARRIVAL, false)).toBe(false);
  });

  test("never hops under reduced motion", () => {
    expect(shouldHopWalk(80, ARRIVAL, true)).toBe(false);
  });
});
