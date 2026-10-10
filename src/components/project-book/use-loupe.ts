"use client";

import { type MotionValue, useMotionValue } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { keyToGlassCommand } from "@/lib/book/keys";
import {
  type GlassMetrics,
  LOUPE_MAGNIFICATION,
  type Point,
  type Size,
  clampGlassCenter,
  fromNormalized,
  glassMetrics,
  lensOverhangRight,
  loupeContentTransform,
  nudgeCenter,
  parkedCenter,
  toNormalized,
} from "@/lib/book/loupe-geometry";
import { runSpring } from "./turn-animator";

/** How the glass glides back to rest. */
const GLASS_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 1, restDelta: 0.0005 } as const;

export interface LoupeRefs {
  /** The masked lens layer. */
  layerRef: RefObject<HTMLDivElement | null>;
  /** The magnified copy of the pages inside the lens. */
  contentRef: RefObject<HTMLDivElement | null>;
  glassRef: RefObject<HTMLDivElement | null>;
}

interface UseLoupeOptions extends LoupeRefs {
  /** The book's frame: the glass and its handle stay within its width. */
  frameRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  toggleRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
  /** A page turn is in flight: the glass moves aside. */
  turning: boolean;
}

export interface GlassHandlers {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export interface Loupe {
  open: boolean;
  /** `fromKeyboard` moves focus onto the glass so it can be steered with arrow keys. */
  toggle: (fromKeyboard: boolean) => void;
  glassHandlers: GlassHandlers;
}

interface Drag {
  pointerId: number;
  left: number;
  top: number;
  offsetX: number;
  offsetY: number;
}

/** Pixel values written to styles, rounded so float noise never reaches the DOM. */
function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`;
}

function sizeOf(stage: HTMLElement): Size {
  return { width: stage.clientWidth, height: stage.clientHeight };
}

/**
 * The stage, and the room right of it inside the frame for the handle. The
 * room is measured as laid out: the dialog's opening animation may still be
 * scaling everything when this runs, so the on-screen gap is scaled back.
 */
function measure(stage: HTMLElement, frame: HTMLElement): GlassMetrics {
  const size = sizeOf(stage);
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width > 0 ? size.width / stageRect.width : 1;
  const roomRight = (frame.getBoundingClientRect().right - stageRect.right) * scale;
  return glassMetrics(size, roomRight);
}

function parkedPosition(metrics: GlassMetrics): Point {
  return toNormalized(parkedCenter(metrics), metrics.stage);
}

function glide(u: MotionValue<number>, v: MotionValue<number>, target: Point, reducedMotion: boolean) {
  if (reducedMotion) {
    u.jump(target.x);
    v.jump(target.y);
    return;
  }
  runSpring(u, target.x, GLASS_SPRING, 0);
  runSpring(v, target.y, GLASS_SPRING, 0);
}

const subscribeNever = () => () => {};

/** False in server HTML and while hydrating; true once the client has taken over. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * The magnifying glass. It rests off the book's bottom-right corner from the
 * start; the toolbar puts it away and brings it back. It mounts only once
 * hydrated, because where it rests depends on measuring the stage.
 *
 * Its position is kept as fractions of the stage in two MotionValues, so it
 * survives resizes and moves without re-rendering React; every change is
 * written straight to the glass, the lens mask and the magnified copy of the
 * pages.
 */
export function useLoupe({
  frameRef,
  stageRef,
  toggleRef,
  layerRef,
  contentRef,
  glassRef,
  reducedMotion,
  turning,
}: UseLoupeOptions): Loupe {
  const hydrated = useHydrated();
  const [shown, setShown] = useState(true);
  const open = shown && hydrated;
  const u = useMotionValue(0);
  const v = useMotionValue(0);
  const focusGlassOnOpen = useRef(false);
  const dragRef = useRef<Drag | null>(null);
  /** At (or gliding to) its resting place, so it follows that place across resizes. */
  const restingRef = useRef(true);
  const metricsRef = useRef<GlassMetrics | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    const layer = layerRef.current;
    const content = contentRef.current;
    const glass = glassRef.current;
    if (!open || !frame || !stage || !layer || !content || !glass) {
      return;
    }
    // Measured once and on resize only: reading layout inside apply, after the
    // previous apply's style writes, would force a layout on every move.
    let metrics = measure(stage, frame);
    metricsRef.current = metrics;
    const apply = () => {
      const radius = metrics.diameter / 2;
      const center = clampGlassCenter(fromNormalized({ x: u.get(), y: v.get() }, metrics.stage), metrics);
      glass.style.setProperty("--glass-d", px(metrics.diameter));
      glass.style.transform = `translate3d(${px(center.x - radius)}, ${px(center.y - radius)}, 0)`;
      layer.style.setProperty("--glass-r", px(radius));
      layer.style.setProperty("--lx", px(center.x));
      layer.style.setProperty("--ly", px(center.y));
      content.style.transform = loupeContentTransform(center, LOUPE_MAGNIFICATION);
    };
    // A resting glass follows its resting place; a moved one is pulled inside
    // the new bounds for good, so the next drag or nudge starts where it is drawn.
    const settle = () => {
      layer.style.setProperty("--lens-overhang-right", px(lensOverhangRight(metrics)));
      const center = restingRef.current
        ? parkedCenter(metrics)
        : clampGlassCenter(fromNormalized({ x: u.get(), y: v.get() }, metrics.stage), metrics);
      const next = toNormalized(center, metrics.stage);
      u.jump(next.x);
      v.jump(next.y);
      apply();
    };
    settle();
    const stopU = u.on("change", apply);
    const stopV = v.on("change", apply);
    // The frame too: the room right of the book decides where the glass may go.
    const observer = new ResizeObserver(() => {
      metrics = measure(stage, frame);
      metricsRef.current = metrics;
      settle();
    });
    observer.observe(stage);
    observer.observe(frame);
    return () => {
      stopU();
      stopV();
      observer.disconnect();
    };
  }, [open, frameRef, stageRef, layerRef, contentRef, glassRef, u, v]);

  useEffect(() => {
    if (open && focusGlassOnOpen.current) {
      focusGlassOnOpen.current = false;
      glassRef.current?.focus();
    }
  }, [open, glassRef]);

  // A turning leaf would sweep over the glass: send it back to rest first. The
  // glide is left to finish even if the turn lands sooner; any later move of
  // the glass (a jump, another glide) takes over the values and stops it.
  useEffect(() => {
    const metrics = metricsRef.current;
    if (!open || !turning || !metrics || restingRef.current) {
      return;
    }
    restingRef.current = true;
    glide(u, v, parkedPosition(metrics), reducedMotion);
  }, [open, turning, reducedMotion, u, v]);

  const currentCenter = (stage: Size): Point => fromNormalized({ x: u.get(), y: v.get() }, stage);

  const moveTo = (center: Point, metrics: GlassMetrics) => {
    restingRef.current = false;
    const next = toNormalized(clampGlassCenter(center, metrics), metrics.stage);
    u.jump(next.x);
    v.jump(next.y);
  };

  const close = (restoreFocus: boolean) => {
    if (restoreFocus) {
      toggleRef.current?.focus();
    }
    setShown(false);
  };

  const toggle = (fromKeyboard: boolean) => {
    if (open) {
      close(false);
      return;
    }
    // It comes back to rest; the layout effect places it there once mounted.
    restingRef.current = true;
    focusGlassOnOpen.current = fromKeyboard;
    setShown(true);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const stage = stageRef.current;
    const metrics = metricsRef.current;
    if (event.button !== 0 || !stage || !metrics) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const center = currentCenter(metrics.stage);
    dragRef.current = {
      pointerId: event.pointerId,
      left: rect.left,
      top: rect.top,
      offsetX: event.clientX - rect.left - center.x,
      offsetY: event.clientY - rect.top - center.y,
    };
    event.currentTarget.dataset.dragging = "";
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot always be captured; moves still arrive on the glass.
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const metrics = metricsRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !metrics) {
      return;
    }
    event.stopPropagation();
    moveTo({ x: event.clientX - drag.left - drag.offsetX, y: event.clientY - drag.top - drag.offsetY }, metrics);
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      delete event.currentTarget.dataset.dragging;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const command = keyToGlassCommand(event);
    if (!command) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (command.kind === "close") {
      close(true);
      return;
    }
    const metrics = metricsRef.current;
    if (!metrics) {
      return;
    }
    if (command.kind === "park") {
      restingRef.current = true;
      glide(u, v, parkedPosition(metrics), reducedMotion);
      return;
    }
    moveTo(nudgeCenter(currentCenter(metrics.stage), command.move, metrics, command.fast), metrics);
  };

  return {
    open,
    toggle,
    glassHandlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd, onKeyDown },
  };
}
