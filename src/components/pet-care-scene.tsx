"use client";

import type { CSSProperties, ReactNode } from "react";
import type { PetId } from "@/components/pet-artwork";
import {
  getPetAnchorsPx,
  type PetAnchorsPx,
  type PetReaction,
} from "@/components/pet-rig";
import type { PetTreat } from "@/components/use-pet-care";
import { FxHeart, fxDelay } from "@/components/pet-fx-parts";
import { SIGNATURE_PLAY_FX } from "@/components/pet-signatures";

/**
 * The props for a care reaction, placed on the pet's own beak and ground line.
 *
 * Eating is peck-and-munch: the treat is set down in front of the beak, loses
 * a bite to each of three pecks (each throwing crumbs), and is gone on the
 * third. Drinking is how birds actually drink: dip, scoop, tilt back and
 * swallow, three times, so the bowl sits at the beak and ripples on each dip.
 *
 * The pet's body motion is in `src/styles/pet-motion/core.css`; the beats
 * there and here (`PECK_AT`, `SIP_AT`) are the same fractions of the reaction.
 */

type CareSceneProps = {
  petId: PetId;
  reaction: PetReaction;
  treat: PetTreat | null;
};

type SceneProps = { anchors: PetAnchorsPx };

const TREATS: Record<PetTreat, { emoji: string; crumbs: readonly [string, string] }> = {
  apple: { emoji: "🍎", crumbs: ["#e11d48", "#fde68a"] },
  berries: { emoji: "🫐", crumbs: ["#4338ca", "#8b5cf6"] },
  cookie: { emoji: "🍪", crumbs: ["#b45309", "#78350f"] },
};

const FOOD_SIZE = 18;
/** How far past the beak tip the treat's centre sits. */
const FOOD_AHEAD_OF_BEAK = 5;
/** Emoji glyphs carry a little empty space at the bottom of their box. */
const FOOD_SINK = 1;
const PECK_AT = [0.26, 0.46, 0.66] as const;
const CRUMB_SIZE = 3;
const CRUMB_SPRAY = [
  { x: -8, rise: -9 },
  { x: 6, rise: -12 },
  { x: 12, rise: -6 },
] as const;
/** Bites come out of the side facing the bird. */
const BITE_MASKS = [
  null,
  "radial-gradient(circle at 2px 6px, transparent 0 5.5px, #000 6px)",
  "radial-gradient(circle at 2px 6px, transparent 0 5.5px, #000 6px), radial-gradient(circle at 3px 13px, transparent 0 5px, #000 5.5px)",
] as const;

const BOWL_WIDTH = 28;
const BOWL_HEIGHT = 12;
const BOWL_AHEAD_OF_BEAK = 4;
const WATER_SURFACE_Y = 4;
const SIP_AT = [0.2, 0.44, 0.63] as const;
const RIPPLE_WIDTH = 8;
const RIPPLE_HEIGHT = 3;
const DROPLETS = [
  { x: 9, rise: -9, at: 0.82 },
  { x: 14, rise: -4, at: 0.85 },
  { x: 5, rise: -12, at: 0.88 },
] as const;
const DROPLET_SIZE = 4;

function maskStyle(mask: string): CSSProperties {
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

function BackLayer({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      data-pet-scene-layer="back"
      className="pointer-events-none absolute inset-0"
      // Behind the bird: the sprite wrapper is a stacking context (it carries
      // the facing transform), so -1 paints under the pet but above the page.
      style={{ zIndex: -1 }}
    >
      {children}
    </span>
  );
}

function FrontLayer({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      data-pet-scene-layer="front"
      className="pointer-events-none absolute inset-0"
    >
      {children}
    </span>
  );
}

function EatScene({ anchors, treat }: SceneProps & { treat: PetTreat }) {
  const look = TREATS[treat];
  const foodLeft = anchors.mouthX + FOOD_AHEAD_OF_BEAK - FOOD_SIZE / 2;
  const foodTop = anchors.groundY + FOOD_SINK - FOOD_SIZE;
  const biteX = foodLeft + 2;
  const biteY = foodTop + 6;

  return (
    <>
      <BackLayer>
        <span
          data-pet-food
          className="absolute"
          style={{ left: foodLeft, top: foodTop, width: FOOD_SIZE, height: FOOD_SIZE }}
        >
          {BITE_MASKS.map((mask, stage) => (
            <span
              key={stage}
              data-pet-food-stage={stage}
              className="absolute inset-0 grid place-items-center text-[16px] leading-none"
              style={mask ? maskStyle(mask) : undefined}
            >
              {look.emoji}
            </span>
          ))}
        </span>
      </BackLayer>
      <FrontLayer>
        {PECK_AT.flatMap((at, peck) =>
          CRUMB_SPRAY.map((spray, index) => (
            <span
              key={`${peck}-${index}`}
              data-pet-fx="crumb"
              className="absolute rounded-[1px]"
              style={
                {
                  left: biteX,
                  top: biteY,
                  width: CRUMB_SIZE,
                  height: CRUMB_SIZE,
                  background: look.crumbs[(peck + index) % 2],
                  animationDelay: fxDelay("reaction", at),
                  // Alternate pecks spray the other way so no two look alike.
                  "--crumb-x": `${peck % 2 === 0 ? spray.x : -spray.x * 0.8}px`,
                  "--crumb-rise": `${spray.rise}px`,
                  "--crumb-fall": `${anchors.groundY - biteY - CRUMB_SIZE}px`,
                } as CSSProperties
              }
            />
          ))
        )}
        <FxHeart x={anchors.headX} y={anchors.headY - 6} at={0.9} clock="reaction" />
      </FrontLayer>
    </>
  );
}

function WaterBowl() {
  return (
    <svg viewBox="0 0 28 12" width={BOWL_WIDTH} height={BOWL_HEIGHT} className="overflow-visible">
      <path
        d="M0.8 3.6 C1.2 9.2 5.5 11.6 14 11.6 C22.5 11.6 26.8 9.2 27.2 3.6 Z"
        fill="#64748b"
      />
      <path
        d="M3 7.8 C6 10.4 22 10.4 25 7.8"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
        fill="none"
      />
      <ellipse cx="14" cy="3.6" rx="13.2" ry="3" fill="#e2e8f0" />
      <ellipse cx="14" cy="3.9" rx="11.4" ry="2.1" fill="#475569" />
      <ellipse data-pet-water cx="14" cy={WATER_SURFACE_Y} rx="11" ry="1.9" fill="#38bdf8" />
      <ellipse cx="10" cy="3.5" rx="3.5" ry="0.6" fill="#e0f2fe" opacity="0.85" />
    </svg>
  );
}

function DrinkScene({ anchors }: SceneProps) {
  const bowlCenter = anchors.mouthX + BOWL_AHEAD_OF_BEAK;
  const bowlTop = anchors.groundY + 1 - BOWL_HEIGHT;
  const waterY = bowlTop + WATER_SURFACE_Y;

  return (
    <>
      <BackLayer>
        <span
          data-pet-bowl
          className="absolute"
          style={{
            left: bowlCenter - BOWL_WIDTH / 2,
            top: bowlTop,
            width: BOWL_WIDTH,
            height: BOWL_HEIGHT,
          }}
        >
          <WaterBowl />
        </span>
        {SIP_AT.map((at) => (
          <span
            key={at}
            data-pet-fx="ripple"
            className="absolute rounded-[50%]"
            style={{
              left: anchors.mouthX + 1 - RIPPLE_WIDTH / 2,
              top: waterY - RIPPLE_HEIGHT / 2,
              width: RIPPLE_WIDTH,
              height: RIPPLE_HEIGHT,
              animationDelay: fxDelay("reaction", at),
            }}
          />
        ))}
      </BackLayer>
      <FrontLayer>
        {DROPLETS.map((drop) => (
          <span
            key={drop.at}
            data-pet-fx="droplet"
            className="absolute"
            style={
              {
                left: anchors.mouthX - DROPLET_SIZE / 2,
                top: anchors.mouthY - DROPLET_SIZE / 2,
                width: DROPLET_SIZE,
                height: DROPLET_SIZE,
                animationDelay: fxDelay("reaction", drop.at),
                "--drop-x": `${drop.x}px`,
                "--drop-rise": `${drop.rise}px`,
                "--drop-fall": `${anchors.groundY - anchors.mouthY}px`,
              } as CSSProperties
            }
          />
        ))}
      </FrontLayer>
    </>
  );
}

/** The original Play reaction, kept for pets that have no signature move yet. */
function LegacyPlaySparkles() {
  return (
    <span aria-hidden="true" data-pet-play-sparkles className="absolute inset-0">
      <span>✦</span>
      <span>♥</span>
      <span>✦</span>
    </span>
  );
}

export function PetCareScene({ petId, reaction, treat }: CareSceneProps) {
  const anchors = getPetAnchorsPx(petId);

  if (reaction === "eat") {
    return treat ? <EatScene anchors={anchors} treat={treat} /> : null;
  }

  if (reaction === "drink") {
    return <DrinkScene anchors={anchors} />;
  }

  const signature = SIGNATURE_PLAY_FX[petId];
  return signature ? <FrontLayer>{signature(anchors)}</FrontLayer> : <LegacyPlaySparkles />;
}
