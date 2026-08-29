"use client";

/* eslint-disable @next/next/no-img-element */

import type { Ref } from "react";
import { withBasePath } from "@/lib/utils";

export const DEFAULT_PET_ID = "among-us";
export const PET_STORAGE_KEY = "portfolio-selected-pet";
export const PET_CHANGE_EVENT = "portfolio-pet-change";

export type MovementType = "walk" | "hop";

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
    movementType: "hop",
    assetPath: "/pets/angry-birds/red.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "chuck",
    name: "Chuck",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/chuck.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.04,
    cursorScale: 1.05,
  },
  {
    id: "bomb",
    name: "Bomb",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/bomb.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.05,
    cursorScale: 1.06,
  },
  {
    id: "matilda",
    name: "Matilda",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/matilda.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.04,
    cursorScale: 1.05,
  },
  {
    id: "stella",
    name: "Stella",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/stella.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.04,
    cursorScale: 1.05,
  },
  {
    id: "terence",
    name: "Terence",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/terence.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "mighty-eagle",
    name: "Mighty Eagle",
    family: "Classic flock",
    movementType: "hop",
    assetPath: "/pets/angry-birds/mighty-eagle.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "blues",
    name: "Blues",
    family: "Classic flock",
    movementType: "hop",
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
    movementType: "hop",
    assetPath: "/pets/angry-birds/hal.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
  {
    id: "silver",
    name: "Silver",
    family: "Extended flock",
    movementType: "hop",
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
    movementType: "hop",
    assetPath: "/pets/angry-birds/bubbles.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.06,
    cursorScale: 1.06,
  },
  {
    id: "melody",
    name: "Melody",
    family: "Extended flock",
    movementType: "hop",
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
    movementType: "hop",
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
    movementType: "hop",
    assetPath: "/pets/angry-birds/hatchlings.png",
    sourceWidth: 1000,
    sourceHeight: 1000,
    previewScale: 1.08,
    cursorScale: 1.08,
  },
];

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
      <img
        ref={imageRef}
        src={withBasePath(pet.assetPath)}
        alt=""
        draggable={false}
        data-pet-image={pet.id}
        className="pointer-events-none select-none"
        style={{
          width,
          height,
          objectFit: "contain",
          transformOrigin: "center bottom",
          willChange: preview ? undefined : "transform",
        }}
      />
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
