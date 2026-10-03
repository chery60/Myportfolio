"use client";

import { useMotionValue } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { keyToGlassCommand } from "@/lib/book/keys";
import {
  LOUPE_MAGNIFICATION,
  type Point,
  type Size,
  clampGlassCenter,
  fromNormalized,
  glassDiameter,
  loupeContentTransform,
  nudgeCenter,
  parkedCenter,
  toNormalized,
} from "@/lib/book/loupe-geometry";
import { runSpring } from "./turn-animator";

/** How the glass glides when tapped into place or pushed aside. */
const GLASS_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 1, restDelta: 0.0005 } as const;

export interface LoupeRefs {
  /** The masked lens layer. */
  layerRef: RefObject<HTMLDivElement | null>;
  /** The magnified copy of the pages inside the lens. */
  contentRef: RefObject<HTMLDivElement | null>;
  glassRef: RefObject<HTMLDivElement | null>;
}

interface UseLoupeOptions extends LoupeRefs {
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
  /** Glides the glass to a point on the stage (px). */
  placeAt: (point: Point) => void;
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

function sizeOf(stage: HTMLElement | null): Size {
  return { width: stage?.clientWidth ?? 0, height: stage?.clientHeight ?? 0 };
}

function parkedPosition(size: Size): Point {
  return toNormalized(parkedCenter(size, glassDiameter(size.width) / 2), size);
}

/**
 * The magnifying glass. Its position is kept as fractions of the stage in two
 * MotionValues, so it survives resizes and moves without re-rendering React;
 * every change is written straight to the glass, the lens mask and the
 * magnified copy of the pages.
 */
export function useLoupe({
  stageRef,
  toggleRef,
  layerRef,
  contentRef,
  glassRef,
  reducedMotion,
  turning,
}: UseLoupeOptions): Loupe {
  const [open, setOpen] = useState(false);
  const u = useMotionValue(0);
  const v = useMotionValue(0);
  const focusGlassOnOpen = useRef(false);
  const dragRef = useRef<Drag | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const content = contentRef.current;
    const glass = glassRef.current;
    if (!open || !stage || !layer || !content || !glass) {
      return;
    }
    // Measured once and on resize only: reading it inside apply, after the
    // previous apply's style writes, would force a layout on every move.
    let size = sizeOf(stage);
    const apply = () => {
      const diameter = glassDiameter(size.width);
      const radius = diameter / 2;
      const center = clampGlassCenter(fromNormalized({ x: u.get(), y: v.get() }, size), size);
      glass.style.setProperty("--glass-d", px(diameter));
      glass.style.transform = `translate3d(${px(center.x - radius)}, ${px(center.y - radius)}, 0)`;
      layer.style.setProperty("--glass-r", px(radius));
      layer.style.setProperty("--lx", px(center.x));
      layer.style.setProperty("--ly", px(center.y));
      content.style.transform = loupeContentTransform(center, LOUPE_MAGNIFICATION);
    };
    apply();
    const stopU = u.on("change", apply);
    const stopV = v.on("change", apply);
    const observer = new ResizeObserver(() => {
      size = sizeOf(stage);
      apply();
    });
    observer.observe(stage);
    return () => {
      stopU();
      stopV();
      observer.disconnect();
    };
  }, [open, stageRef, layerRef, contentRef, glassRef, u, v]);

  useEffect(() => {
    if (open && focusGlassOnOpen.current) {
      focusGlassOnOpen.current = false;
      glassRef.current?.focus();
    }
  }, [open, glassRef]);

  const glideTo = (target: Point) => {
    if (reducedMotion) {
      u.jump(target.x);
      v.jump(target.y);
      return;
    }
    runSpring(u, target.x, GLASS_SPRING, 0);
    runSpring(v, target.y, GLASS_SPRING, 0);
  };

  // A turning leaf would sweep over the glass: park it first. The glide is
  // left to finish even if the turn lands sooner; any later move of the glass
  // (a jump, another glide) takes over the values and stops it.
  useEffect(() => {
    if (!open || !turning) {
      return;
    }
    const target = parkedPosition(sizeOf(stageRef.current));
    if (reducedMotion) {
      u.jump(target.x);
      v.jump(target.y);
      return;
    }
    runSpring(u, target.x, GLASS_SPRING, 0);
    runSpring(v, target.y, GLASS_SPRING, 0);
  }, [open, turning, reducedMotion, stageRef, u, v]);

  const currentCenter = (size: Size): Point => fromNormalized({ x: u.get(), y: v.get() }, size);

  const moveTo = (center: Point, size: Size) => {
    const next = toNormalized(clampGlassCenter(center, size), size);
    u.jump(next.x);
    v.jump(next.y);
  };

  const close = (restoreFocus: boolean) => {
    if (restoreFocus) {
      toggleRef.current?.focus();
    }
    setOpen(false);
  };

  const toggle = (fromKeyboard: boolean) => {
    if (open) {
      close(false);
      return;
    }
    const parked = parkedPosition(sizeOf(stageRef.current));
    u.jump(parked.x);
    v.jump(parked.y);
    focusGlassOnOpen.current = fromKeyboard;
    setOpen(true);
  };

  const placeAt = (point: Point) => {
    const size = sizeOf(stageRef.current);
    glideTo(toNormalized(clampGlassCenter(point, size), size));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const stage = stageRef.current;
    if (event.button !== 0 || !stage) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const center = currentCenter(sizeOf(stage));
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
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.stopPropagation();
    moveTo(
      { x: event.clientX - drag.left - drag.offsetX, y: event.clientY - drag.top - drag.offsetY },
      sizeOf(stageRef.current),
    );
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
    const size = sizeOf(stageRef.current);
    if (command.kind === "close") {
      close(true);
    } else if (command.kind === "park") {
      glideTo(parkedPosition(size));
    } else {
      moveTo(nudgeCenter(currentCenter(size), command.move, size, command.fast), size);
    }
  };

  return {
    open,
    toggle,
    placeAt,
    glassHandlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd, onKeyDown },
  };
}
