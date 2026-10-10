"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * The parked pet noticing the visitor.
 *
 * A pet that ignores the cursor reads as a sticker; one that leans toward it
 * reads as alive. Within a short radius the pet tips a few degrees toward the
 * pointer, and a hover that lingers on it counts as being petted: a happy
 * squish and a heart, then a cooldown so it never becomes a fidget toy.
 *
 * The lean is written straight to CSS custom properties on `layerRef`, once
 * per animation frame at most, so following the cursor never re-renders React.
 * The easing back to upright is a CSS transition in pet-motion `core.css`.
 */

const ATTENTION_RADIUS_PX = 260;
const MAX_LEAN_DEG = 5;
const MAX_LEAN_PX = 2;
const PET_AFTER_HOVER_MS = 700;
const PETTED_MS = 1_200;
const PETTING_COOLDOWN_MS = 6_000;

const LOOK_ROTATE = "--pet-look-rotate";
const LOOK_X = "--pet-look-x";

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function usePetAttention(
  enabled: boolean,
  layerRef: RefObject<HTMLElement | null>
) {
  const [petted, setPetted] = useState(false);
  const enabledRef = useRef(enabled);
  const hoverTimerRef = useRef<number | undefined>(undefined);
  const pettedTimerRef = useRef<number | undefined>(undefined);
  const lastPettedAtRef = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!enabled || !layer) {
      return;
    }

    let frame: number | null = null;
    let pointer: Point | null = null;

    const lean = () => {
      frame = null;
      if (!pointer) return;

      const rect = layer.getBoundingClientRect();
      const dx = pointer.x - (rect.left + rect.width / 2);
      const dy = pointer.y - (rect.top + rect.height / 2);
      const amount =
        Math.hypot(dx, dy) < ATTENTION_RADIUS_PX
          ? clamp(dx / ATTENTION_RADIUS_PX, -1, 1)
          : 0;

      layer.style.setProperty(LOOK_ROTATE, `${(amount * MAX_LEAN_DEG).toFixed(2)}deg`);
      layer.style.setProperty(LOOK_X, `${(amount * MAX_LEAN_PX).toFixed(2)}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame === null) {
        frame = window.requestAnimationFrame(lean);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      layer.style.removeProperty(LOOK_ROTATE);
      layer.style.removeProperty(LOOK_X);
    };
  }, [enabled, layerRef]);

  useEffect(() => {
    return () => {
      window.clearTimeout(hoverTimerRef.current);
      window.clearTimeout(pettedTimerRef.current);
    };
  }, []);

  const onPointerEnter = useCallback(() => {
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      if (!enabledRef.current || now - lastPettedAtRef.current < PETTING_COOLDOWN_MS) {
        return;
      }
      lastPettedAtRef.current = now;
      setPetted(true);
      window.clearTimeout(pettedTimerRef.current);
      pettedTimerRef.current = window.setTimeout(() => setPetted(false), PETTED_MS);
    }, PET_AFTER_HOVER_MS);
  }, []);

  const onPointerLeave = useCallback(() => {
    window.clearTimeout(hoverTimerRef.current);
  }, []);

  return {
    petted: enabled && petted,
    hoverHandlers: { onPointerEnter, onPointerLeave },
  };
}
