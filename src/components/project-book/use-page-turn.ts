"use client";

import { type MotionValue, useMotionValue } from "motion/react";
import { type Dispatch, useLayoutEffect, useRef } from "react";
import { CANCEL_SPRING, COMMIT_SPRING } from "@/lib/book/curl-geometry";
import { stepTarget } from "@/lib/book/pages";
import type { BookAction, BookState } from "@/lib/book/turn-machine";
import type { TurnDirection } from "@/lib/book/types";
import { runSpring } from "./turn-animator";

export interface PageTurn {
  /** Turn progress, 0 (leaf over the lower view) to 1 (leaf over the higher view). */
  progress: MotionValue<number>;
  /** Animated turn from a button, key or tap; an instant jump with reduced motion. */
  step: (dir: TurnDirection) => void;
  /** Starts a drag-driven turn; false when there is nothing to turn to. */
  dragBegin: (dir: TurnDirection) => boolean;
  dragMove: (progress: number) => void;
  /** Hands the leaf to the spring with the release velocity (progress per second). */
  dragEnd: (commit: boolean, velocity: number) => void;
}

/**
 * Drives the page-turn spring. Progress lives in a MotionValue so the curl is
 * written to the DOM per frame without re-rendering React; the reducer only
 * hears about a turn when it starts, is released, and settles.
 */
export function usePageTurn(state: BookState, dispatch: Dispatch<BookAction>, reducedMotion: boolean): PageTurn {
  const progress = useMotionValue(0);
  const releaseVelocity = useRef(0);
  const { turn } = state;

  useLayoutEffect(() => {
    if (!turn || turn.phase !== "settling") {
      return;
    }
    const from = turn.dir === "next" ? 0 : 1;
    const to = 1 - from;
    if (turn.source === "step") {
      progress.jump(from);
    }
    let live = true;
    const spring = runSpring(
      progress,
      turn.commit ? to : from,
      turn.commit ? COMMIT_SPRING : CANCEL_SPRING,
      releaseVelocity.current,
    );
    spring.finished.then(() => {
      if (live) {
        dispatch({ type: "settled", id: turn.id });
      }
    });
    return () => {
      live = false;
      spring.stop();
    };
  }, [turn, progress, dispatch]);

  const step = (dir: TurnDirection) => {
    if (reducedMotion) {
      const target = stepTarget(state.page, dir, state.layout, state.total);
      if (target !== null && !turn) {
        dispatch({ type: "jump", page: target });
      }
      return;
    }
    releaseVelocity.current = 0;
    dispatch({ type: "begin", dir, source: "step" });
  };

  const dragBegin = (dir: TurnDirection) => {
    if (reducedMotion || turn || stepTarget(state.page, dir, state.layout, state.total) === null) {
      return false;
    }
    progress.jump(dir === "next" ? 0 : 1);
    dispatch({ type: "begin", dir, source: "drag" });
    return true;
  };

  const dragMove = (value: number) => progress.set(value);

  const dragEnd = (commit: boolean, velocity: number) => {
    releaseVelocity.current = velocity;
    dispatch({ type: "release", commit });
  };

  return { progress, step, dragBegin, dragMove, dragEnd };
}
