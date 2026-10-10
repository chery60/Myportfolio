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
/*
 * The resting glass, as in a photographed desk: its centre sits this fraction
 * of its diameter in from the book's right edge and below its bottom edge.
 * The CSS mirrors REST_DROP_RATIO and the diameter to leave room under the
 * book (project-book.module.css).
 */
const REST_INSET_RATIO = 0.33;
const REST_DROP_RATIO = 0.08;
/** How far right of the glass centre the handle reaches (loupe.module.css draws it). */
const HANDLE_REACH_RATIO = 0.9;
/** Space kept between the handle's end and the frame's edge. */
const FRAME_GAP = 8;
/** One key press moves the glass this fraction of the stage width. */
const NUDGE_RATIO = 0.02;
const NUDGE_FAST_MULTIPLIER = 4;

/** The stage as the glass sees it, measured once per resize. */
export interface GlassMetrics {
  stage: Size;
  diameter: number;
  /** The glass centre stays within 0…maxX and 0…maxY (stage pixels). */
  maxX: number;
  maxY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function glassDiameter(stageWidth: number): number {
  return clamp(stageWidth * GLASS_WIDTH_RATIO, GLASS_MIN_DIAMETER, GLASS_MAX_DIAMETER);
}

/**
 * `roomRight` is the free space between the stage's right edge and the book
 * frame's. The glass may hang off the bottom edge as far as it does at rest,
 * and never so far right that its handle would leave the frame (the dialog).
 */
export function glassMetrics(stage: Size, roomRight: number): GlassMetrics {
  const diameter = glassDiameter(stage.width);
  const handleLimit = stage.width + Math.max(roomRight, 0) - diameter * HANDLE_REACH_RATIO - FRAME_GAP;
  return {
    stage,
    diameter,
    maxX: clamp(handleLimit, 0, stage.width),
    maxY: stage.height + diameter * REST_DROP_RATIO,
  };
}

export function clampGlassCenter(center: Point, metrics: GlassMetrics): Point {
  return { x: clamp(center.x, 0, metrics.maxX), y: clamp(center.y, 0, metrics.maxY) };
}

/**
 * How far right of the book the lens must reach to fill the glass wherever
 * it goes. Any further and the lens layer alone would widen the page.
 */
export function lensOverhangRight(metrics: GlassMetrics): number {
  return Math.max(metrics.maxX + metrics.diameter / 2 - metrics.stage.width, 0);
}

/** Where the glass rests when not in use: hanging off the book's bottom-right corner. */
export function parkedCenter(metrics: GlassMetrics): Point {
  const { stage, diameter } = metrics;
  return clampGlassCenter(
    { x: stage.width - diameter * REST_INSET_RATIO, y: stage.height + diameter * REST_DROP_RATIO },
    metrics,
  );
}

export function nudgeCenter(center: Point, move: GlassMove, metrics: GlassMetrics, fast = false): Point {
  const step = metrics.stage.width * NUDGE_RATIO * (fast ? NUDGE_FAST_MULTIPLIER : 1);
  const dx = move === "left" ? -step : move === "right" ? step : 0;
  const dy = move === "up" ? -step : move === "down" ? step : 0;
  return clampGlassCenter({ x: center.x + dx, y: center.y + dy }, metrics);
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
