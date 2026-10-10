/**
 * Hop-walking for the birds.
 *
 * Small birds hop rather than stride, and Angry Birds are small round birds,
 * so a short trip toward the cursor is a run of hops instead of a slingshot
 * flight. Each hop has the three beats that make a jump read as weighty:
 * a crouch (anticipation), an airborne arc that stretches on the way up and
 * tips nose-down on the way down, and a squash on landing.
 *
 * Pure functions only: `pet-cursor.tsx` owns the rAF loop and the DOM writes.
 * The lift is applied to the bird image, never to the ground position, so the
 * shadow stays on the ground and shrinks while the bird is in the air.
 */

export type Point = { x: number; y: number };

export type HopStyle = {
  /** Longest ground distance covered by one hop, in px. */
  stride: number;
  durationMs: number;
  /** Peak lift, in px. */
  height: number;
};

export type Hop = {
  start: Point;
  end: Point;
  startedAt: number;
  durationMs: number;
  height: number;
  direction: 1 | -1;
};

export type HopPose = {
  /** 0 on the ground, 1 at the top of the arc. */
  lift: number;
  scaleX: number;
  scaleY: number;
  /** Degrees; negative is nose-up for a bird facing its travel direction. */
  tilt: number;
};

/** Beyond this the bird flies instead, exactly as it always has. */
export const HOP_WALK_MAX_DISTANCE = 150;

const CROUCH_END = 0.15;
const LAND_START = 0.85;
const AIR_SPAN = LAND_START - CROUCH_END;
const LAND_SPAN = 1 - LAND_START;
/** Share of the airborne phase spent springing out of the crouch. */
const TAKEOFF_BLEND = 0.25;

const CROUCH_SCALE_X = 1.08;
const CROUCH_SCALE_Y = 0.9;
const AIR_STRETCH = 0.07;
const STRETCH_THINNING = 0.8;
const LAND_SQUASH_X = 0.1;
const LAND_SQUASH_Y = 0.12;
const MAX_TILT_DEG = 6;

const SHADOW_SHRINK = 0.32;
const SHADOW_OPACITY = 0.9;
const SHADOW_FADE = 0.4;

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function smoothstep(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function shouldHopWalk(
  distance: number,
  arrivalThreshold: number,
  reducedMotion: boolean
): boolean {
  return (
    !reducedMotion &&
    distance > arrivalThreshold &&
    distance < HOP_WALK_MAX_DISTANCE
  );
}

export function createHop(
  position: Point,
  target: Point,
  time: number,
  style: HopStyle
): Hop {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  const reachesTarget = distance <= style.stride;
  const ratio = reachesTarget || distance === 0 ? 1 : style.stride / distance;

  return {
    start: position,
    end: reachesTarget
      ? target
      : { x: position.x + dx * ratio, y: position.y + dy * ratio },
    startedAt: time,
    durationMs: style.durationMs,
    height: style.height,
    direction: dx < 0 ? -1 : 1,
  };
}

/** Where the bird's feet are: still while crouching, travelling in the air. */
export function getHopGroundPosition(hop: Hop, progress: number): Point {
  if (progress <= CROUCH_END) return hop.start;
  if (progress >= LAND_START) return hop.end;

  const airborne = (progress - CROUCH_END) / AIR_SPAN;
  return {
    x: lerp(hop.start.x, hop.end.x, airborne),
    y: lerp(hop.start.y, hop.end.y, airborne),
  };
}

export function getHopPose(progress: number): HopPose {
  if (progress <= CROUCH_END) {
    const crouch = progress / CROUCH_END;
    return {
      lift: 0,
      scaleX: lerp(1, CROUCH_SCALE_X, crouch),
      scaleY: lerp(1, CROUCH_SCALE_Y, crouch),
      tilt: 0,
    };
  }

  if (progress < LAND_START) {
    const airborne = (progress - CROUCH_END) / AIR_SPAN;
    const spring = smoothstep(airborne / TAKEOFF_BLEND);
    const stretch = AIR_STRETCH * Math.cos(Math.PI * airborne) ** 2;
    return {
      lift: Math.sin(Math.PI * airborne),
      scaleX: lerp(CROUCH_SCALE_X, 1 - stretch * STRETCH_THINNING, spring),
      scaleY: lerp(CROUCH_SCALE_Y, 1 + stretch, spring),
      tilt: -MAX_TILT_DEG * Math.cos(Math.PI * airborne) * spring,
    };
  }

  // Landing: the fall's stretch drains away as the impact squash builds, so
  // there is no single-frame snap between the two.
  const landing = Math.min((progress - LAND_START) / LAND_SPAN, 1);
  const leftover = AIR_STRETCH * (1 - landing) ** 3;
  const squash = Math.sin(Math.PI * landing);
  return {
    lift: 0,
    scaleX: 1 - leftover * STRETCH_THINNING + LAND_SQUASH_X * squash,
    scaleY: 1 + leftover - LAND_SQUASH_Y * squash,
    tilt: MAX_TILT_DEG * (1 - landing) ** 2,
  };
}

export function getHopTransforms(pose: HopPose, height: number) {
  return {
    image: `translateY(${(-pose.lift * height).toFixed(2)}px) rotate(${pose.tilt.toFixed(
      2
    )}deg) scale(${pose.scaleX.toFixed(3)}, ${pose.scaleY.toFixed(3)})`,
    shadow: `translateX(-50%) scale(${(1 - pose.lift * SHADOW_SHRINK).toFixed(3)})`,
    shadowOpacity: (SHADOW_OPACITY - pose.lift * SHADOW_FADE).toFixed(2),
  };
}
