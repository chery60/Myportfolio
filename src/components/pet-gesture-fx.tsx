"use client";

import type { ReactNode } from "react";
import type { PetId } from "@/components/pet-artwork";
import {
  getPetAnchorsPx,
  getPetRig,
  type PetAnchorsPx,
  type PetGesture,
} from "@/components/pet-rig";
import { FxFeather, FxHeart, FxPuff, FxSeed } from "@/components/pet-fx-parts";
import { SIGNATURE_QUIRK_FX } from "@/components/pet-signatures";

/**
 * The secondary action that sells an idle gesture: the seeds a bird pecks at,
 * the feather that comes loose while it preens, the dust it kicks up hopping.
 * The body motion is in `src/styles/pet-motion/core.css`; the beats here are
 * the same fractions of the gesture.
 */

type GestureFxProps = {
  petId: PetId;
  gesture: PetGesture | undefined;
  petted: boolean;
};

const FRAME_CENTER_X = 38;
const SEED_SPACING = 4;
const SEEDS_EATEN_AT = [0.2, 0.5, 0.95] as const;
/** Where the wander hop lands, as horizontal offsets from home; see `petWanderPath`. */
const WANDER_LANDINGS = [
  { x: -22, at: 0.18 },
  { x: -44, at: 0.3 },
  { x: -22, at: 0.68 },
  { x: 0, at: 0.8 },
] as const;
const DUST_SIZE = 6;

function GestureProps({
  petId,
  gesture,
  anchors,
}: {
  petId: PetId;
  gesture: PetGesture;
  anchors: PetAnchorsPx;
}): ReactNode {
  const feather = getPetRig(petId).feather;

  switch (gesture) {
    case "peck":
      return SEEDS_EATEN_AT.map((eatenAt, index) => (
        <FxSeed
          key={eatenAt}
          x={anchors.mouthX + 2 + index * SEED_SPACING}
          y={anchors.groundY - 1}
          at={0}
          eatenAt={eatenAt}
          clock="gesture"
        />
      ));
    case "preen":
      return (
        <FxFeather color={feather} x={anchors.tailX + 3} y={anchors.tailY} at={0.5} clock="gesture" />
      );
    case "fluff":
      return (
        <>
          <FxFeather color={feather} x={anchors.tailX + 4} y={anchors.mouthY - 8} at={0.28} clock="gesture" />
          <FxFeather color={feather} x={anchors.mouthX - 6} y={anchors.headY + 10} at={0.38} clock="gesture" />
        </>
      );
    case "wander":
      return WANDER_LANDINGS.map((landing) => (
        <FxPuff
          key={landing.at}
          kind="dust"
          size={DUST_SIZE}
          x={FRAME_CENTER_X + landing.x}
          y={anchors.groundY - 1}
          at={landing.at}
          clock="gesture"
        />
      ));
    case "quirk":
      return SIGNATURE_QUIRK_FX[petId]?.(anchors) ?? null;
    default:
      return null;
  }
}

export function PetGestureFx({ petId, gesture, petted }: GestureFxProps) {
  if ((!gesture || gesture === "none") && !petted) {
    return null;
  }

  const anchors = getPetAnchorsPx(petId);

  return (
    <span
      aria-hidden="true"
      data-pet-gesture-fx={gesture ?? "none"}
      className="pointer-events-none absolute inset-0"
    >
      {gesture && gesture !== "none" ? (
        <GestureProps petId={petId} gesture={gesture} anchors={anchors} />
      ) : null}
      {petted ? (
        <FxHeart x={anchors.headX + 4} y={anchors.headY - 6} at={0} clock="gesture" />
      ) : null}
    </span>
  );
}
