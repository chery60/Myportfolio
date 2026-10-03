"use client";

import { type RefObject, useEffect, useRef } from "react";
import { layoutForWidth } from "@/lib/book/pages";
import type { BookLayout } from "@/lib/book/types";

/**
 * One ResizeObserver for the book:
 * - the frame's width picks the layout (two-page spread or single page);
 * - the stage's size is published as `--stage-w` / `--stage-h`, from which the
 *   CSS derives page and strip widths for the curl.
 *
 * `onLayout` fires on the first measurement and then only when the layout
 * actually changes.
 */
export function useBookSize(
  frameRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  onLayout: (layout: BookLayout) => void,
): void {
  const onLayoutRef = useRef(onLayout);

  useEffect(() => {
    onLayoutRef.current = onLayout;
  }, [onLayout]);

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) {
      return;
    }
    let reported: BookLayout | null = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (entry.target === stage) {
          stage.style.setProperty("--stage-w", `${width}px`);
          stage.style.setProperty("--stage-h", `${height}px`);
        }
        if (entry.target === frame) {
          const layout = layoutForWidth(width);
          if (layout !== reported) {
            reported = layout;
            onLayoutRef.current(layout);
          }
        }
      }
    });
    observer.observe(frame);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [frameRef, stageRef]);
}
