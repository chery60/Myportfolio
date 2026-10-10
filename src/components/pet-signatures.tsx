"use client";

import type { ReactNode } from "react";
import type { PetId } from "@/components/pet-artwork";
import type { PetAnchorsPx } from "@/components/pet-rig";
import { FxGlyph, FxPuff, fxDelay } from "@/components/pet-fx-parts";

/**
 * Each character's own props, rendered next to its body while it performs
 * its signature (the Play reaction) or its idle quirk. The body motion that
 * goes with them lives in `src/styles/pet-motion/signatures.css`, keyed off
 * `data-selected-pet`. A pet is added here in its own pass, once it has been
 * researched and signed off; until then Play keeps the original hop.
 */

type SignatureFx = (anchors: PetAnchorsPx) => ReactNode;

const SOUNDWAVE_BEATS = [0.28, 0.36, 0.44] as const;
const SOUNDWAVE_WIDTH = 8;
const SOUNDWAVE_HEIGHT = 16;

/** Red's battle cry: three sound-wave arcs leave the beak in quick succession. */
function RedBattleCry({ anchors }: { anchors: PetAnchorsPx }) {
  return (
    <>
      {SOUNDWAVE_BEATS.map((at) => (
        <span
          key={at}
          aria-hidden="true"
          data-pet-fx="soundwave"
          className="absolute"
          style={{
            left: anchors.mouthX + 1,
            top: anchors.mouthY - SOUNDWAVE_HEIGHT / 2 - 1,
            width: SOUNDWAVE_WIDTH,
            height: SOUNDWAVE_HEIGHT,
            animationDelay: fxDelay("reaction", at),
          }}
        />
      ))}
    </>
  );
}

/** Red's grumpy huff: two puffs of steam off the top of the head. */
function RedHuff({ anchors }: { anchors: PetAnchorsPx }) {
  return (
    <>
      <FxPuff kind="steam" x={anchors.headX - 7} y={anchors.headY - 4} at={0.3} clock="gesture" />
      <FxPuff
        kind="steam"
        x={anchors.headX + 6}
        y={anchors.headY - 6}
        at={0.48}
        clock="gesture"
        size={11}
      />
    </>
  );
}

const FRAME_CENTER_X = 38;
const FRAME_SIZE = FRAME_CENTER_X * 2;
const SPEEDLINE_HEIGHT = 2;
/** The speed smear stretches his body sideways; the lines start past it. */
const SMEAR_CLEARANCE = 8;
/** Three trailing lines of different lengths around the middle of the body. */
const SPEEDLINES = [
  { dy: -8, width: 13 },
  { dy: 0, width: 18 },
  { dy: 8, width: 10 },
] as const;
/**
 * Where Chuck stops after each dash, as offsets from home. These match the
 * `petChuckZoomPath` keyframes in signatures.css; the skid dust lands there.
 */
const CHUCK_FAR_STOP_X = -64;
const CHUCK_HOME_OVERSHOOT_X = 6;
const SKID_DUST_SIZE = 8;

/**
 * Chuck's speed burst: rev up, zoom off, skid, zoom back, skid, pose.
 *
 * The lines ride a "track" that runs the same path as his body, so they stay
 * glued to him: behind him (to his right) on the way out, behind him (to his
 * left) on the way back. Skid dust stays on the ground where he stopped.
 *
 * On the way out he is flipped to face left, so what trails on his right is
 * his tail, mirrored: `FRAME_SIZE - tailX`.
 */
function ChuckSpeedBurst({ anchors }: { anchors: PetAnchorsPx }) {
  const bodyY = (anchors.headY + anchors.groundY) / 2;
  const lines = (side: "out" | "back") =>
    SPEEDLINES.map((line) => (
      <span
        key={line.dy}
        aria-hidden="true"
        data-pet-fx="speedline"
        className="absolute rounded-full"
        style={{
          left:
            side === "out"
              ? FRAME_SIZE - anchors.tailX + SMEAR_CLEARANCE
              : anchors.tailX - SMEAR_CLEARANCE - line.width,
          top: bodyY + line.dy - SPEEDLINE_HEIGHT / 2,
          width: line.width,
          height: SPEEDLINE_HEIGHT,
        }}
      />
    ));

  return (
    <>
      <span data-pet-fx-track="chuck-out" className="absolute inset-0">
        {lines("out")}
      </span>
      <span data-pet-fx-track="chuck-back" className="absolute inset-0">
        {lines("back")}
      </span>
      <FxPuff
        kind="dust"
        size={SKID_DUST_SIZE}
        x={FRAME_CENTER_X + CHUCK_FAR_STOP_X - 6}
        y={anchors.groundY - 2}
        at={0.27}
        clock="reaction"
      />
      <FxPuff
        kind="dust"
        size={SKID_DUST_SIZE}
        x={FRAME_CENTER_X + CHUCK_HOME_OVERSHOOT_X + 8}
        y={anchors.groundY - 2}
        at={0.53}
        clock="reaction"
      />
    </>
  );
}

/**
 * Chuck's restless crash: he fidgets at full speed, runs out of battery and
 * nods off mid-bounce ("z"), then jolts awake ("!"). Canon: he tires himself
 * out and falls asleep by accident.
 */
function ChuckRestlessCrash({ anchors }: { anchors: PetAnchorsPx }) {
  return (
    <>
      <FxGlyph
        kind="snooze"
        glyph="z"
        x={anchors.headX + 10}
        y={anchors.headY - 2}
        at={0.5}
        clock="gesture"
      />
      <FxGlyph
        kind="exclaim"
        glyph="!"
        x={anchors.headX + 2}
        y={anchors.headY - 10}
        at={0.66}
        clock="gesture"
      />
    </>
  );
}

export const SIGNATURE_PLAY_FX: Partial<Record<PetId, SignatureFx>> = {
  red: (anchors) => <RedBattleCry anchors={anchors} />,
  chuck: (anchors) => <ChuckSpeedBurst anchors={anchors} />,
};

export const SIGNATURE_QUIRK_FX: Partial<Record<PetId, SignatureFx>> = {
  red: (anchors) => <RedHuff anchors={anchors} />,
  chuck: (anchors) => <ChuckRestlessCrash anchors={anchors} />,
};
