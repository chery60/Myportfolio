import { motionValue } from "motion/react";
import { describe, expect, test } from "vitest";
import { COMMIT_SPRING } from "@/lib/book/curl-geometry";
import { runSpring } from "./turn-animator";

describe("runSpring", () => {
  test("drives a motion value toward the target and can be stopped part-way", () => {
    const value = motionValue(0);

    const spring = runSpring(value, 1, COMMIT_SPRING, 0);
    spring.stop();

    expect(value.get()).toBeGreaterThanOrEqual(0);
    expect(value.get()).toBeLessThanOrEqual(1);
    expect(spring.finished).toBeInstanceOf(Promise);
  });

  test("settles exactly on the target", async () => {
    const value = motionValue(0);

    await runSpring(value, 1, { ...COMMIT_SPRING, stiffness: 2000, damping: 120 }, 0).finished;

    expect(value.get()).toBe(1);
  });
});
