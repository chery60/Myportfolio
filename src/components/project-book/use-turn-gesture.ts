"use client";

import { type PointerEvent, useRef } from "react";
import { DRAG_SPAN_RATIO, TAP_SLOP_PX, dragProgress, pxVelocityToProgress, releaseDecision } from "@/lib/book/curl-geometry";
import type { BookLayout, TurnDirection } from "@/lib/book/types";
import type { PageTurn } from "./use-page-turn";

/** Pointer samples older than this are ignored when measuring release speed. */
const VELOCITY_WINDOW_MS = 80;
/** Shorter windows give meaningless speeds; treat them as a standstill. */
const MIN_VELOCITY_SPAN_MS = 10;
/** With reduced motion a swipe this long (px) turns the page instantly. */
const SWIPE_DISTANCE_PX = 40;

type Mode = "pending" | "drag" | "swipe" | "scroll" | "blocked";

interface Sample {
  x: number;
  t: number;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  left: number;
  top: number;
  side: "left" | "right";
  span: number;
  mode: Mode;
  dir: TurnDirection;
  moved: number;
  samples: readonly Sample[];
}

export interface TapPoint {
  side: "left" | "right";
  /** Point within the stage, in px. */
  x: number;
  y: number;
}

interface TurnGestureOptions {
  layout: BookLayout;
  turn: PageTurn;
  reducedMotion: boolean;
  onTap: (tap: TapPoint) => void;
}

export interface TurnGestureHandlers {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => void;
}

function velocityPxPerSecond(samples: readonly Sample[]): number {
  const first = samples[0];
  const last = samples.at(-1);
  if (!first || !last || last.t - first.t < MIN_VELOCITY_SPAN_MS) {
    return 0;
  }
  return ((last.x - first.x) / (last.t - first.t)) * 1000;
}

/** Elements inside the stage that keep their own pointer behaviour. */
const OWN_POINTER_TARGETS = "[data-glass], a, button";

/**
 * Drag, swipe and tap on the book. A horizontal drag turns the page under the
 * finger (left = forward); a mostly vertical one is left to the page scroll
 * (`touch-action: pan-y` lets the browser take it and cancel ours); a press
 * that barely moves is a tap on whichever half was pressed.
 */
export function useTurnGesture({ layout, turn, reducedMotion, onTap }: TurnGestureOptions): TurnGestureHandlers {
  const gestureRef = useRef<Gesture | null>(null);

  const finishDrag = (gesture: Gesture, commit: boolean | null) => {
    const velocity = pxVelocityToProgress(velocityPxPerSecond(gesture.samples), gesture.span);
    const decision =
      commit === null
        ? releaseDecision({ moved: gesture.moved, progress: turn.progress.get(), velocity, dir: gesture.dir })
        : commit
          ? "commit"
          : "cancel";
    turn.dragEnd(decision === "commit", decision === "commit" ? velocity : 0);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.isPrimary === false || event.button !== 0) {
      return;
    }
    // A press from a new pointer means the previous one's release never
    // arrived (lost capture, a synthetic pointer): let the old drag go.
    const stale = gestureRef.current;
    if (stale) {
      if (stale.pointerId === event.pointerId) {
        return;
      }
      gestureRef.current = null;
      if (stale.mode === "drag") {
        finishDrag(stale, false);
      }
    }
    if (event.target instanceof Element && event.target.closest(OWN_POINTER_TARGETS)) {
      return;
    }
    const stage = event.currentTarget;
    const rect = stage.getBoundingClientRect();
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      side: event.clientX - rect.left > rect.width / 2 ? "right" : "left",
      span: rect.width * DRAG_SPAN_RATIO[layout],
      mode: "pending",
      dir: "next",
      moved: 0,
      samples: [{ x: event.clientX, t: event.timeStamp }],
    };
    try {
      stage.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers (some automation tools) cannot be captured; the drag still works.
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    let { mode, dir } = gesture;
    if (mode === "pending") {
      if (Math.abs(dy) > TAP_SLOP_PX && Math.abs(dy) > Math.abs(dx)) {
        mode = "scroll";
      } else if (Math.abs(dx) > TAP_SLOP_PX) {
        dir = dx < 0 ? "next" : "prev";
        mode = reducedMotion ? "swipe" : turn.dragBegin(dir) ? "drag" : "blocked";
      }
    }
    const sample = { x: event.clientX, t: event.timeStamp };
    gestureRef.current = {
      ...gesture,
      mode,
      dir,
      moved: Math.max(gesture.moved, Math.hypot(dx, dy)),
      samples: [...gesture.samples.filter((s) => sample.t - s.t <= VELOCITY_WINDOW_MS), sample],
    };
    if (mode === "drag") {
      turn.dragMove(dragProgress(dx, gesture.span, dir));
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    gestureRef.current = null;
    if (gesture.mode === "pending") {
      onTap({ side: gesture.side, x: event.clientX - gesture.left, y: event.clientY - gesture.top });
    } else if (gesture.mode === "drag") {
      finishDrag(gesture, null);
    } else if (gesture.mode === "swipe" && Math.abs(event.clientX - gesture.startX) >= SWIPE_DISTANCE_PX) {
      turn.step(gesture.dir);
    }
  };

  const onPointerAbort = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    gestureRef.current = null;
    if (gesture.mode === "drag") {
      finishDrag(gesture, false);
    }
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerAbort,
    onLostPointerCapture: onPointerAbort,
  };
}
