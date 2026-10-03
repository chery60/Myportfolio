/**
 * Geometry for the magnifying glass. All points are in stage pixels, origin
 * at the stage's top-left corner.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type GlassMove = "left" | "right" | "up" | "down";

export const LOUPE_MAGNIFICATION = 2.3;
export const GLASS_MIN_DIAMETER = 140;
export const GLASS_MAX_DIAMETER = 262;
const GLASS_WIDTH_RATIO = 0.235;
const PARK_INSET = 12;
/** One key press moves the glass this fraction of the stage width. */
const NUDGE_RATIO = 0.02;
const NUDGE_FAST_MULTIPLIER = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function glassDiameter(stageWidth: number): number {
  return clamp(stageWidth * GLASS_WIDTH_RATIO, GLASS_MIN_DIAMETER, GLASS_MAX_DIAMETER);
}

export function clampGlassCenter(center: Point, stage: Size): Point {
  return { x: clamp(center.x, 0, stage.width), y: clamp(center.y, 0, stage.height) };
}

/** Where the glass rests when it is not in use: the book's bottom-right corner. */
export function parkedCenter(stage: Size, radius: number, inset: number = PARK_INSET): Point {
  return clampGlassCenter(
    { x: Math.max(stage.width - radius - inset, 0), y: Math.max(stage.height - radius - inset, 0) },
    stage,
  );
}

export function nudgeCenter(center: Point, move: GlassMove, stage: Size, fast = false): Point {
  const step = stage.width * NUDGE_RATIO * (fast ? NUDGE_FAST_MULTIPLIER : 1);
  const dx = move === "left" ? -step : move === "right" ? step : 0;
  const dy = move === "up" ? -step : move === "down" ? step : 0;
  return clampGlassCenter({ x: center.x + dx, y: center.y + dy }, stage);
}

/**
 * Translation for the magnified layer (scaled about its top-left corner) that
 * keeps the point under the glass centre in place: c + offset… = c.
 */
export function lensOffset(center: Point, magnification: number): Point {
  return { x: center.x * (1 - magnification), y: center.y * (1 - magnification) };
}

export function loupeContentTransform(center: Point, magnification: number): string {
  const offset = lensOffset(center, magnification);
  return `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${magnification})`;
}

/** Positions are stored as fractions of the stage so the glass stays put across resizes. */
export function toNormalized(point: Point, stage: Size): Point {
  return {
    x: stage.width > 0 ? point.x / stage.width : 0,
    y: stage.height > 0 ? point.y / stage.height : 0,
  };
}

export function fromNormalized(point: Point, stage: Size): Point {
  return { x: point.x * stage.width, y: point.y * stage.height };
}
