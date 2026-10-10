"use client";

import type { CSSProperties } from "react";

/**
 * Small drawn props shared by the care scene and the idle gestures.
 *
 * Every part is absolutely positioned in the pet's 76px frame by its centre,
 * and starts its CSS animation after a delay given as a *fraction* of the
 * running action (`--pet-reaction-ms` or `--pet-gesture-ms`), so a prop always
 * lands on its beat even when a heavier pet does the same action more slowly.
 */

export type FxClock = "reaction" | "gesture";

type FxPosition = {
  x: number;
  y: number;
  /** When to start, as a share of the running action. */
  at: number;
  clock: FxClock;
};

export function fxDelay(clock: FxClock, at: number): string {
  return `calc(var(--pet-${clock}-ms, 0ms) * ${at})`;
}

function placed(
  { x, y, at, clock }: FxPosition,
  width: number,
  height: number,
  extra?: CSSProperties
): CSSProperties {
  return {
    left: x - width / 2,
    top: y - height / 2,
    width,
    height,
    animationDelay: fxDelay(clock, at),
    ...extra,
  };
}

const HEART_SIZE = 10;
const FEATHER_WIDTH = 10;
const FEATHER_HEIGHT = 4;
const PUFF_SIZE = 9;

export function FxHeart(props: FxPosition) {
  return (
    <span
      aria-hidden="true"
      data-pet-fx="heart"
      className="absolute"
      style={placed(props, HEART_SIZE, HEART_SIZE)}
    >
      <svg viewBox="0 0 10 10" width={HEART_SIZE} height={HEART_SIZE}>
        <path
          d="M5 9 C1.6 6.6 0.4 4.9 0.4 3.2 C0.4 1.7 1.5 0.6 2.9 0.6 C3.8 0.6 4.6 1.1 5 1.9 C5.4 1.1 6.2 0.6 7.1 0.6 C8.5 0.6 9.6 1.7 9.6 3.2 C9.6 4.9 8.4 6.6 5 9 Z"
          fill="#fb7185"
        />
      </svg>
    </span>
  );
}

export function FxFeather({
  color,
  ...props
}: FxPosition & { color: string }) {
  return (
    <span
      aria-hidden="true"
      data-pet-fx="feather"
      className="absolute"
      style={placed(props, FEATHER_WIDTH, FEATHER_HEIGHT)}
    >
      <svg viewBox="0 0 10 4" width={FEATHER_WIDTH} height={FEATHER_HEIGHT}>
        <path d="M0 2 C3 0 7 0 10 2 C7 4 3 4 0 2 Z" fill={color} />
        <path d="M0.5 2 L9.5 2" stroke="rgba(0,0,0,0.28)" strokeWidth="0.45" />
      </svg>
    </span>
  );
}

/** A soft round puff: steam, dust or breath, depending on `kind`. */
export function FxPuff({
  kind,
  size = PUFF_SIZE,
  ...props
}: FxPosition & { kind: "steam" | "dust"; size?: number }) {
  return (
    <span
      aria-hidden="true"
      data-pet-fx={kind}
      className="absolute rounded-full"
      style={placed(props, size, size)}
    />
  );
}

const GLYPH_SIZE = 12;

/** A drawn-on cartoon mark, like the "z" of a nap or the "!" of a jolt. */
export function FxGlyph({
  kind,
  glyph,
  ...props
}: FxPosition & { kind: "snooze" | "exclaim"; glyph: string }) {
  return (
    <span
      aria-hidden="true"
      data-pet-fx={kind}
      className="absolute grid select-none place-items-center leading-none"
      style={placed(props, GLYPH_SIZE, GLYPH_SIZE)}
    >
      {glyph}
    </span>
  );
}

export function FxSeed(props: FxPosition & { eatenAt: number }) {
  const { eatenAt, ...position } = props;
  return (
    <span
      aria-hidden="true"
      data-pet-fx="seed"
      className="absolute rounded-full"
      style={placed(position, 3, 2.4, {
        // Two animations: the seed appears with the gesture, then is gone the
        // instant the beak lands on it.
        animationDelay: `0ms, ${fxDelay(position.clock, eatenAt)}`,
      })}
    />
  );
}
