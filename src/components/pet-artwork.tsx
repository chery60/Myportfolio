"use client";

/* eslint-disable @next/next/no-img-element */

import type { Ref } from "react";
import { withBasePath } from "@/lib/utils";

export const DEFAULT_PET_ID = "among-us";
export const PET_STORAGE_KEY = "portfolio-selected-pet";
export const PET_CHANGE_EVENT = "portfolio-pet-change";

export type MovementType = "walk" | "fly";

export type PetId =
  | "among-us"
  | "red"
  | "chuck"
  | "bomb"
  | "matilda"
  | "stella"
  | "terence"
  | "mighty-eagle"
  | "blues"
  | "hal"
  | "silver"
  | "bubbles"
  | "melody"
  | "willow"
  | "hatchlings";

export type PetOption = {
  id: PetId;
  name: string;
  family: "Crewmate" | "Classic flock" | "Extended flock";
  movementType: MovementType;
  assetPath?: string;
  sourceWidth: number;
  sourceHeight: number;
  previewScale: number;
  cursorScale: number;
};

type PetArtworkProps = {
  petId: PetId;
  moving?: boolean;
  preview?: boolean;
  imageRef?: Ref<HTMLImageElement>;
  shadowRef?: Ref<HTMLDivElement>;
};

const OUTLINE =
  "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)";

const BODY_SHINE = "rgba(255,255,255,0.18)";
const PET_ARTWORK_SIZE = 76;
const PET_PREVIEW_SIZE = 88;

export const PETS: PetOption[] = [
  {
    id: "among-us",
    name: "Among Us",
    family: "Crewmate",
    movementType: "walk",
    sourceWidth: 36,
    sourceHeight: 44,
    previewScale: 1,
    cursorScale: 1,
  },
  {
    id: "red",
    name: "Red",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/red.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "chuck",
    name: "Chuck",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/chuck.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.04,
    cursorScale: 1.05,
  },
  {
    id: "bomb",
    name: "Bomb",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/bomb.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.05,
    cursorScale: 1.06,
  },
  {
    id: "matilda",
    name: "Matilda",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/matilda.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.04,
    cursorScale: 1.05,
  },
  {
    id: "stella",
    name: "Stella",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/stella.png",
    sourceWidth: 297,
    sourceHeight: 225,
    previewScale: 1.12,
    cursorScale: 1.1,
  },
  {
    id: "terence",
    name: "Terence",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/terence.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "mighty-eagle",
    name: "Mighty Eagle",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/mighty-eagle.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "blues",
    name: "Blues",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/blues.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.06,
    cursorScale: 1.06,
  },
  {
    id: "hal",
    name: "Hal",
    family: "Classic flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/hal.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "silver",
    name: "Silver",
    family: "Extended flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/silver.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.06,
    cursorScale: 1.06,
  },
  {
    id: "bubbles",
    name: "Bubbles",
    family: "Extended flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/bubbles.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.06,
    cursorScale: 1.06,
  },
  {
    id: "melody",
    name: "Melody",
    family: "Extended flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/melody.png",
    sourceWidth: 500,
    sourceHeight: 500,
    previewScale: 1.1,
    cursorScale: 1.1,
  },
  {
    id: "willow",
    name: "Willow",
    family: "Extended flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/willow.png",
    sourceWidth: 842,
    sourceHeight: 595,
    previewScale: 1.16,
    cursorScale: 1.14,
  },
  {
    id: "hatchlings",
    name: "Hatchlings",
    family: "Extended flock",
    movementType: "fly",
    assetPath: "/pets/angry-birds/hatchlings.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
];

/**
 * Where each pet's eyes are, so they can be closed.
 *
 * Every bird is a single flat PNG with its eyes permanently open, and there are
 * no closed-eye variants, so sleeping and blinking are drawn on top: one
 * clipped oval per eye with a lid that sweeps down inside it.
 *
 * Coordinates are fractions of the source image, never pixels, so they hold at
 * any render size and for the non-square sources (Stella 297x225, Willow
 * 842x595).  is the feather colour beside the eye, so the closed lid reads
 * as eyelid rather than as a patch stuck on the face.
 *
 * These were measured against the artwork and checked at the real 76px render
 * size. If you swap a PNG, re-measure — a few percent off is visible.
 *
 * Blues and Hatchlings are three characters in one image, hence six eyes each.
 * Hal and Mighty Eagle are drawn in profile and show only one.
 */
type EyeRect = { x: number; y: number; w: number; h: number };

const PET_EYES: Partial<Record<PetId, { lid: string; eyes: EyeRect[] }>> = {
  "red": { lid: "#e8202a", eyes: [{ x: 0.514, y: 0.560, w: 0.132, h: 0.132 }, { x: 0.634, y: 0.560, w: 0.112, h: 0.130 }] },
  "chuck": { lid: "#f2df00", eyes: [{ x: 0.424, y: 0.655, w: 0.106, h: 0.062 }, { x: 0.668, y: 0.652, w: 0.072, h: 0.060 }] },
  "bomb": { lid: "#14211a", eyes: [{ x: 0.432, y: 0.374, w: 0.082, h: 0.076 }, { x: 0.652, y: 0.378, w: 0.072, h: 0.058 }] },
  "matilda": { lid: "#f6f0e2", eyes: [{ x: 0.444, y: 0.334, w: 0.140, h: 0.148 }, { x: 0.572, y: 0.334, w: 0.124, h: 0.138 }] },
  "stella": { lid: "#f6a8c0", eyes: [{ x: 0.512, y: 0.522, w: 0.182, h: 0.268 }, { x: 0.818, y: 0.522, w: 0.132, h: 0.262 }] },
  "terence": { lid: "#a81d3f", eyes: [{ x: 0.548, y: 0.640, w: 0.076, h: 0.044 }, { x: 0.644, y: 0.640, w: 0.046, h: 0.036 }] },
  "mighty-eagle": { lid: "#f2ead6", eyes: [{ x: 0.238, y: 0.470, w: 0.072, h: 0.062 }] },
  "blues": {
    lid: "#2a9ebd",
    eyes: [
      { x: 0.421, y: 0.232, w: 0.083, h: 0.087 },
      { x: 0.520, y: 0.252, w: 0.078, h: 0.076 },
      { x: 0.384, y: 0.470, w: 0.078, h: 0.086 },
      { x: 0.466, y: 0.466, w: 0.086, h: 0.092 },
      { x: 0.414, y: 0.710, w: 0.088, h: 0.098 },
      { x: 0.530, y: 0.726, w: 0.080, h: 0.082 },
    ],
  },
  "hal": { lid: "#1f7a45", eyes: [{ x: 0.222, y: 0.548, w: 0.088, h: 0.086 }] },
  "silver": { lid: "#67737f", eyes: [{ x: 0.534, y: 0.556, w: 0.114, h: 0.115 }, { x: 0.718, y: 0.552, w: 0.100, h: 0.104 }] },
  "bubbles": { lid: "#f2a92a", eyes: [{ x: 0.450, y: 0.566, w: 0.112, h: 0.080 }, { x: 0.560, y: 0.580, w: 0.090, h: 0.064 }] },
  "melody": { lid: "#f6d9a8", eyes: [{ x: 0.398, y: 0.550, w: 0.144, h: 0.122 }, { x: 0.616, y: 0.552, w: 0.126, h: 0.118 }] },
  "willow": { lid: "#56a6db", eyes: [{ x: 0.598, y: 0.578, w: 0.050, h: 0.070 }, { x: 0.654, y: 0.572, w: 0.050, h: 0.070 }] },
  "hatchlings": {
    lid: "#f0e4d2",
    eyes: [
      { x: 0.105, y: 0.400, w: 0.125, h: 0.132 },
      { x: 0.256, y: 0.396, w: 0.078, h: 0.076 },
      { x: 0.400, y: 0.512, w: 0.108, h: 0.116 },
      { x: 0.505, y: 0.509, w: 0.112, h: 0.118 },
      { x: 0.673, y: 0.415, w: 0.082, h: 0.090 },
      { x: 0.778, y: 0.374, w: 0.130, h: 0.136 },
    ],
  },
};

export function getPetEyes(petId: PetId) {
  return PET_EYES[petId];
}

const PET_IDS = new Set(PETS.map((pet) => pet.id));

export function isPetId(value: string | null): value is PetId {
  return Boolean(value && PET_IDS.has(value as PetId));
}

export function getPetById(id: PetId) {
  return PETS.find((pet) => pet.id === id) ?? PETS[0];
}

export function PetArtwork({
  petId,
  moving = false,
  preview = false,
  imageRef,
  shadowRef,
}: PetArtworkProps) {
  const pet = getPetById(petId);
  const size = preview ? PET_PREVIEW_SIZE : PET_ARTWORK_SIZE;

  return (
    <div
      data-pet-artwork={petId}
      data-pet-movement={pet.movementType}
      className="relative select-none"
      style={{ width: size, height: size }}
    >
      {pet.movementType === "walk" ? (
        <AmongUsPet moving={moving} preview={preview} />
      ) : (
        <BirdImagePet
          pet={pet}
          preview={preview}
          imageRef={imageRef}
          shadowRef={shadowRef}
        />
      )}
    </div>
  );
}

/**
 * The closed-eye layer.
 *
 * Always rendered, always open by default. Whether the eyes are open, half or
 * shut is decided by an ancestor's `data-pet-eyes` attribute in globals.css —
 * that way `PetArtwork` needs no new props, and the pets drawn outside the
 * cursor (the selector grid, the chat avatar, the mobile greeting) stay awake
 * automatically because nothing above them sets it.
 *
 * Each eye is an oval clipped to the eye's own bounds with a lid inside it, so
 * the lid sweeps down *within* the eye rather than appearing as a rectangle.
 */
function PetEyelids({ petId }: { petId: PetId }) {
  const config = getPetEyes(petId);

  if (!config) {
    return null;
  }

  return (
    <>
      {config.eyes.map((eye, index) => (
        <span
          key={index}
          aria-hidden="true"
          data-pet-eye
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${eye.x * 100}%`,
            top: `${eye.y * 100}%`,
            width: `${eye.w * 100}%`,
            height: `${eye.h * 100}%`,
            borderRadius: "50%",
          }}
        >
          <span
            data-pet-lid
            className="absolute inset-0"
            style={{ background: config.lid }}
          >
            <span
              data-pet-eye-line
              className="absolute left-[12%] right-[12%] top-[64%] h-px rounded-full bg-black/65"
            />
          </span>
        </span>
      ))}
    </>
  );
}

function BirdImagePet({
  pet,
  preview,
  imageRef,
  shadowRef,
}: {
  pet: PetOption;
  preview: boolean;
  imageRef?: Ref<HTMLImageElement>;
  shadowRef?: Ref<HTMLDivElement>;
}) {
  const boxSize = preview ? PET_PREVIEW_SIZE : PET_ARTWORK_SIZE;
  const maxImageSize = preview ? 86 : 76;
  const scale = preview ? pet.previewScale : pet.cursorScale;
  const maxSourceSize = Math.max(pet.sourceWidth, pet.sourceHeight);
  const width = (maxImageSize * scale * pet.sourceWidth) / maxSourceSize;
  const height = (maxImageSize * scale * pet.sourceHeight) / maxSourceSize;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ overflow: "visible" }}
    >
      <div
        ref={shadowRef}
        data-pet-shadow
        className="absolute rounded-full bg-black/15"
        style={{
          width: Math.min(width * 0.48, boxSize * 0.58),
          height: 8,
          bottom: preview ? 8 : 4,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      {/*
        The image is wrapped so the eyelids can be positioned as percentages of
        the *image box* rather than the 76px container — the two differ, and for
        the non-square sources they differ a lot. `imageRef` stays on the <img>
        itself so follow-mode flight banking and depth transforms are unchanged.
      */}
      <div
        className="relative"
        style={{ width, height, transformOrigin: "center bottom" }}
      >
        <img
          ref={imageRef}
          src={withBasePath(pet.assetPath)}
          alt=""
          draggable={false}
          data-pet-image={pet.id}
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transformOrigin: "center bottom",
            willChange: preview ? undefined : "transform",
          }}
        />
        <PetEyelids petId={pet.id} />
      </div>
    </div>
  );
}

function AmongUsPet({
  moving,
  preview,
}: {
  moving: boolean;
  preview: boolean;
}) {
  const characterColor = "#7170ff";
  const scale = preview ? 1.08 : 1;

  return (
    <div
      className={moving && !preview ? "animate-pet-bob" : undefined}
      style={{
        position: "absolute",
        left: "50%",
        bottom: preview ? 9 : 8,
        width: 36,
        height: 44,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "center bottom",
      }}
    >
      <PetShadow width={34} left={1} />
      <div
        className="absolute"
        style={{
          top: 10,
          left: -6,
          width: 14,
          height: 22,
          borderRadius: 6,
          background: characterColor,
          filter: OUTLINE,
        }}
      >
        <Shade height={11} radius="0 0 6px 6px" />
      </div>
      <AmongUsLeg
        side="front"
        moving={moving && !preview}
        color={characterColor}
      />
      <AmongUsLeg
        side="back"
        moving={moving && !preview}
        color={characterColor}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          top: 0,
          right: 0,
          width: 28,
          height: 32,
          borderRadius: "14px 14px 6px 6px",
          background: characterColor,
          filter: OUTLINE,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(0,0,0,0.20)",
            borderRadius: "14px 14px 6px 6px",
            transform: "translateY(3px) translateX(3px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 8,
            left: 8,
            width: 16,
            height: 12,
            borderRadius: "50%",
            background: BODY_SHINE,
            filter: "blur(4px)",
            transform: "translateY(-4px) translateX(2px)",
          }}
        />
      </div>
      <div
        className="absolute overflow-hidden"
        style={{
          top: 6,
          right: -4,
          width: 20,
          height: 12,
          borderRadius: 9999,
          background: "#92d1df",
          filter: OUTLINE,
        }}
      >
        <div
          className="absolute"
          style={{
            top: 4,
            left: 1,
            right: 1,
            height: 10,
            borderRadius: 9999,
            background: "#527f8b",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 2,
            right: 4,
            width: 10,
            height: 3,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.85)",
            transform: "rotate(-8deg)",
          }}
        />

        {/*
          The crewmate has no eyes — the visor is its face. So the visor itself
          is treated as one eye: this lid sweeps down over it in the body colour
          and is clipped to the lozenge for free by the visor's overflow-hidden.
        */}
        <div
          data-pet-eye
          className="absolute inset-0"
          style={{ borderRadius: 9999, overflow: "hidden" }}
        >
          <div
            data-pet-lid
            className="absolute inset-0"
            style={{ background: characterColor }}
          >
            <span
              data-pet-eye-line
              className="absolute left-[16%] right-[16%] top-[62%] h-px rounded-full bg-black/70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AmongUsLeg({
  side,
  moving,
  color,
}: {
  side: "front" | "back";
  moving: boolean;
  color: string;
}) {
  return (
    <div
      data-pet-leg={side}
      className={`absolute ${moving ? `animate-pet-foot-${side === "front" ? "left" : "right"}` : ""}`}
      style={{
        bottom: 2,
        left: side === "front" ? 6 : undefined,
        right: side === "back" ? 4 : undefined,
        width: 12,
        height: 14,
        borderRadius: "2px 2px 6px 6px",
        background: color,
        filter: OUTLINE,
      }}
    >
      <Shade height={8} radius="0 0 6px 6px" />
    </div>
  );
}

function PetShadow({ width, left }: { width: number; left: number }) {
  return (
    <div
      className="absolute bottom-0 rounded-full"
      style={{
        left,
        width,
        height: 8,
        background: "rgba(0,0,0,0.16)",
        filter: "blur(0.2px)",
      }}
    />
  );
}

function Shade({ height, radius }: { height: number; radius: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        height,
        borderRadius: radius,
        background: "rgba(0,0,0,0.20)",
      }}
    />
  );
}
