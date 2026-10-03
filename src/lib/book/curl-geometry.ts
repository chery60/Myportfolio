/**
 * The shape and lighting of a turning page.
 *
 * The leaf is a chain of thin vertical strips, each nested inside the one
 * before it. The root strip swings around the hinge; every nested strip adds a
 * small counter-rotation, so the leaf bows like paper instead of swinging as a
 * board. Lighting comes from how directly each strip faces the reader.
 *
 * Progress `t` runs 0 (leaf flat over the lower view) to 1 (leaf flat on the
 * far side, showing its back).
 */
import type { BookLayout, TurnDirection } from "./types";

/** Strips per leaf. Each face holds a live copy of the page, so this stays small. */
export const STRIP_COUNT = 8;
/** Peak bend of the leaf, in radians, reached halfway through the turn. */
export const CURL_AMPLITUDE = 0.6;
/** Darkest a strip gets when it is edge-on to the reader. */
export const MAX_SHADE = 0.62;
/** Strength of the warm highlight on strips that catch the light. */
export const GLOW_STRENGTH = 0.2;

export interface StripLight {
  /** Shade at the strip's spine-side and outer edges, 0..MAX_SHADE. */
  front: readonly [number, number];
  /** The same shade seen from behind: the gradient runs the other way. */
  back: readonly [number, number];
  glow: number;
}

export interface CurlFrame {
  /** Rotation of the root strip around the hinge, in radians (0..π). */
  rootAngle: number;
  /** Counter-rotation each nested strip adds, in radians. */
  stepAngle: number;
  /** How far the leaf is off the page, 0..1; drives the shadows it casts. */
  shade: number;
  strips: readonly StripLight[];
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function computeCurl(t: number, stripCount: number = STRIP_COUNT): CurlFrame {
  const progress = clamp01(t);
  const lift = Math.sin(Math.PI * progress);
  const bend = CURL_AMPLITUDE * lift;
  const rootAngle = Math.PI * progress + bend;
  const stepAngle = (2 * bend) / Math.max(stripCount, 1);
  const shade = lift;

  const strips = Array.from({ length: stripCount }, (_, i): StripLight => {
    const spineFacing = Math.abs(Math.cos(rootAngle - i * stepAngle));
    const outerFacing = Math.abs(Math.cos(rootAngle - (i + 1) * stepAngle));
    const spineShade = (1 - spineFacing) * MAX_SHADE;
    const outerShade = (1 - outerFacing) * MAX_SHADE;
    const facing = (spineFacing + outerFacing) / 2;
    return {
      front: [spineShade, outerShade],
      back: [outerShade, spineShade],
      glow: shade * facing * facing * GLOW_STRENGTH,
    };
  });

  return { rootAngle, stepAngle, shade, strips };
}

const ANGLE_DIGITS = 4;

/** CSS transforms for the root strip and for every nested strip. */
export function curlTransforms(frame: CurlFrame): { root: string; nested: string } {
  return {
    root: `rotateY(${(-frame.rootAngle).toFixed(ANGLE_DIGITS)}rad)`,
    nested: `rotateY(${frame.stepAngle.toFixed(ANGLE_DIGITS)}rad)`,
  };
}

// --- Dragging ---------------------------------------------------------------

/** Fraction of the stage width a drag must cover to turn the page completely. */
export const DRAG_SPAN_RATIO: Record<BookLayout, number> = { spread: 0.62, single: 0.8 };
/** A press that moves less than this is a tap, not a drag. */
export const TAP_SLOP_PX = 6;
/** Released past this point, a turn completes. */
export const COMMIT_PROGRESS = 0.42;
/** Released faster than this (progress per second), a turn follows the throw. */
export const COMMIT_VELOCITY = 1.1;

/**
 * Progress for a horizontal drag of `dx` pixels. A forward turn starts flat
 * (0) and follows the pointer leftwards; a backward turn starts flipped (1)
 * and follows it rightwards.
 */
export function dragProgress(dx: number, span: number, dir: TurnDirection): number {
  const advance = clamp01((dir === "next" ? -dx : dx) / span);
  return dir === "next" ? advance : 1 - advance;
}

/** Pointer speed in px/s → progress per second (moving left increases progress). */
export function pxVelocityToProgress(velocityX: number, span: number): number {
  return -velocityX / span;
}

export interface ReleaseInput {
  /** Total pointer travel in px since the press. */
  moved: number;
  progress: number;
  /** Progress per second at release. */
  velocity: number;
  dir: TurnDirection;
}

export function releaseDecision({ moved, progress, velocity, dir }: ReleaseInput): "tap" | "commit" | "cancel" {
  if (moved < TAP_SLOP_PX) {
    return "tap";
  }
  const forward = dir === "next";
  const advance = forward ? progress : 1 - progress;
  const towardTarget = forward ? velocity : -velocity;
  if (towardTarget > COMMIT_VELOCITY) {
    return "commit";
  }
  if (towardTarget < -COMMIT_VELOCITY) {
    return "cancel";
  }
  return advance > COMMIT_PROGRESS ? "commit" : "cancel";
}

// --- Springs ----------------------------------------------------------------

export const COMMIT_SPRING = { type: "spring", stiffness: 170, damping: 26, mass: 1, restDelta: 0.001 } as const;
export const CANCEL_SPRING = { type: "spring", stiffness: 150, damping: 24, mass: 1, restDelta: 0.001 } as const;
