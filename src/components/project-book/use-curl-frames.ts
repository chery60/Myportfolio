"use client";

import type { MotionValue } from "motion/react";
import { type RefObject, useLayoutEffect } from "react";
import { computeCurl, curlTransforms } from "@/lib/book/curl-geometry";

/** Darkest the shadow under a lifted leaf gets. */
const GUTTER_SHADOW = 0.55;
const DIGITS = 3;

function setShade(element: HTMLElement | undefined, [start, end]: readonly [number, number]) {
  element?.style.setProperty("--sa", start.toFixed(DIGITS));
  element?.style.setProperty("--sb", end.toFixed(DIGITS));
}

function all(root: HTMLElement, selector: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)];
}

/**
 * Writes the curl for the current progress straight onto the leaf's strips,
 * shade and glow layers, and the shadow beneath. Runs only while a turn is in
 * flight (`turnKey` non-null); re-binds when a new leaf mounts.
 */
export function useCurlFrames(
  progress: MotionValue<number>,
  stageRef: RefObject<HTMLElement | null>,
  turnKey: string | null,
): void {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || turnKey === null) {
      return;
    }
    const strips = all(stage, "[data-strip]");
    const frontShades = all(stage, '[data-shade="front"]');
    const backShades = all(stage, '[data-shade="back"]');
    const glows = all(stage, "[data-glow]");
    const gutter = stage.querySelector<HTMLElement>("[data-gutter]");

    const apply = (t: number) => {
      const frame = computeCurl(t, strips.length);
      const { root, nested } = curlTransforms(frame);
      strips.forEach((strip, i) => {
        strip.style.transform = i === 0 ? root : nested;
      });
      frame.strips.forEach((light, i) => {
        setShade(frontShades[i], light.front);
        setShade(backShades[i], light.back);
      });
      glows.forEach((glow, i) => {
        glow.style.opacity = (frame.strips[Math.floor(i / 2)]?.glow ?? 0).toFixed(DIGITS);
      });
      if (gutter) {
        gutter.style.opacity = (frame.shade * GUTTER_SHADOW).toFixed(DIGITS);
      }
    };

    apply(progress.get());
    return progress.on("change", apply);
  }, [progress, stageRef, turnKey]);
}
