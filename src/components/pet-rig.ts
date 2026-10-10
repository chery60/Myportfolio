import {
  getPetById,
  getPetImageBox,
  PET_ARTWORK_SIZE,
  type PetId,
} from "@/components/pet-artwork";
import type { HopStyle } from "@/lib/pet/hop-walk";

/**
 * Per-pet animation data: where each character's body parts are, how heavy it
 * moves, and which idle behaviours suit it.
 *
 * Every bird is one flat PNG with nothing to articulate, so all motion is the
 * whole body squashing, tipping and hopping — and props (food, the water
 * bowl, crumbs, feathers) have to be placed exactly where the beak and the
 * ground are. Those points live here as fractions of the image box, the same
 * coordinate system the eyelids in `pet-artwork.tsx` use. They were measured
 * from the PNGs' pixels; if you swap an image, re-measure.
 */

export type PetWeight = "light" | "normal" | "heavy";

/** Gestures an awake pet may pick on its own. */
export type PetAmbientGesture =
  | "hop"
  | "wiggle"
  | "stretch"
  | "look-around"
  | "head-tilt"
  | "peck"
  | "preen"
  | "fluff"
  | "wander"
  | "quirk";

/** Every gesture, including the ones that only happen in response to something. */
export type PetGesture = "none" | "startle" | "yawn" | PetAmbientGesture;

export type PetReaction = "eat" | "drink" | "play";

type AnchorPoint = { x: number; y: number };

export type PetRig = {
  /** The beak tip: where food is taken and water is scooped. */
  mouth: AnchorPoint;
  /** Top of the head: steam, notes, hearts rise from here. */
  head: AnchorPoint;
  /** Tail end: where preening reaches and loose feathers come from. */
  tail: AnchorPoint;
  /** Where the body meets the ground, as a fraction of the image height. */
  groundY: number;
  feather: string;
  weight: PetWeight;
  gestures: Partial<Record<PetAmbientGesture, number>>;
  /** Length of the pet's signature move. Without one, Play keeps the original hop. */
  playMs?: number;
  /** Length of the pet's idle quirk, when its palette includes `quirk`. */
  quirkMs?: number;
};

export type GesturePalette = ReadonlyArray<readonly [PetAmbientGesture, number]>;

export type PetAnchorsPx = {
  mouthX: number;
  mouthY: number;
  headX: number;
  headY: number;
  tailX: number;
  tailY: number;
  groundY: number;
  /** Horizontal pivot for pecks, in percent of the 76px frame. */
  pivotXPercent: number;
};

const WEIGHT_TIMING: Record<PetWeight, number> = {
  light: 0.88,
  normal: 1,
  heavy: 1.2,
};

/** Light birds take long, quick, high hops; heavy ones short, slow, low ones. */
const HOP_STYLES: Record<PetWeight, HopStyle> = {
  light: { stride: 34, durationMs: 220, height: 12 },
  normal: { stride: 30, durationMs: 250, height: 10 },
  heavy: { stride: 24, durationMs: 300, height: 7 },
};

/** The original gestures keep their original, CSS-fixed timing. */
const LEGACY_GESTURE_MS = {
  hop: 620,
  wiggle: 900,
  stretch: 1_100,
  startle: 520,
} as const;

const GESTURE_BASE_MS: Record<
  Exclude<PetGesture, "none" | keyof typeof LEGACY_GESTURE_MS | "quirk">,
  number
> = {
  "look-around": 1_700,
  "head-tilt": 1_400,
  peck: 1_500,
  preen: 1_900,
  fluff: 1_300,
  wander: 4_600,
  yawn: 2_000,
};

const DEFAULT_QUIRK_MS = 1_500;
const LEGACY_PLAY_MS = 1_350;

const REACTION_BASE_MS: Record<Exclude<PetReaction, "play">, number> = {
  eat: 3_400,
  drink: 3_200,
};

/** How far toward the beak the peck pivot sits, between centre and beak tip. */
const PIVOT_TOWARD_MOUTH = 0.55;
const FRAME_CENTER_PERCENT = 50;

const BIRD_GESTURES: Partial<Record<PetAmbientGesture, number>> = {
  hop: 1,
  wiggle: 1,
  stretch: 1,
  "look-around": 3,
  "head-tilt": 3,
  peck: 2,
  preen: 2,
  fluff: 1.5,
  wander: 2,
};

const CREWMATE_GESTURES: Partial<Record<PetAmbientGesture, number>> = {
  hop: 1,
  wiggle: 1,
  stretch: 1,
  "look-around": 2,
  "head-tilt": 2,
};

const PET_RIGS: Record<PetId, PetRig> = {
  "among-us": {
    // The crewmate is drawn, not an image; see `getPetAnchorsPx`.
    mouth: { x: 1.05, y: 0.32 },
    head: { x: 0.65, y: 0 },
    tail: { x: -0.1, y: 0.45 },
    groundY: 1,
    feather: "#7170ff",
    weight: "normal",
    gestures: CREWMATE_GESTURES,
  },
  red: {
    mouth: { x: 0.73, y: 0.75 },
    head: { x: 0.56, y: 0.36 },
    tail: { x: 0.2, y: 0.68 },
    groundY: 0.884,
    feather: "#d62828",
    weight: "normal",
    gestures: { ...BIRD_GESTURES, quirk: 1 },
    playMs: 1_800,
    quirkMs: 1_600,
  },
  chuck: {
    mouth: { x: 0.77, y: 0.76 },
    head: { x: 0.52, y: 0.32 },
    tail: { x: 0.1, y: 0.72 },
    groundY: 0.892,
    feather: "#f2df00",
    weight: "light",
    // Scatterbrained and unable to sit still: more looking about, more
    // wandering, and the fidget that ends in an accidental nap.
    gestures: { ...BIRD_GESTURES, "look-around": 4, wander: 3, quirk: 1.5 },
    playMs: 1_700,
    quirkMs: 2_100,
  },
  bomb: {
    mouth: { x: 0.79, y: 0.49 },
    head: { x: 0.5, y: 0.27 },
    tail: { x: 0.18, y: 0.6 },
    groundY: 0.908,
    feather: "#1f2937",
    weight: "heavy",
    gestures: BIRD_GESTURES,
  },
  matilda: {
    mouth: { x: 0.62, y: 0.68 },
    head: { x: 0.55, y: 0.22 },
    tail: { x: 0.12, y: 0.6 },
    groundY: 0.892,
    feather: "#f6f0e2",
    weight: "normal",
    gestures: BIRD_GESTURES,
  },
  stella: {
    mouth: { x: 0.8, y: 0.84 },
    head: { x: 0.6, y: 0.1 },
    tail: { x: 0.05, y: 0.62 },
    groundY: 0.996,
    feather: "#f6a8c0",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
  terence: {
    mouth: { x: 0.72, y: 0.72 },
    head: { x: 0.42, y: 0.12 },
    tail: { x: 0.04, y: 0.58 },
    groundY: 0.888,
    feather: "#a81d3f",
    weight: "heavy",
    gestures: BIRD_GESTURES,
  },
  "mighty-eagle": {
    mouth: { x: 0.82, y: 0.64 },
    head: { x: 0.3, y: 0.4 },
    tail: { x: 0.05, y: 0.66 },
    groundY: 0.868,
    feather: "#8b5a2b",
    weight: "heavy",
    gestures: BIRD_GESTURES,
  },
  blues: {
    mouth: { x: 0.54, y: 0.8 },
    head: { x: 0.55, y: 0.14 },
    tail: { x: 0.35, y: 0.6 },
    groundY: 0.976,
    feather: "#2a9ebd",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
  hal: {
    mouth: { x: 0.9, y: 0.62 },
    head: { x: 0.3, y: 0.36 },
    tail: { x: 0.08, y: 0.72 },
    groundY: 0.892,
    feather: "#1f7a45",
    weight: "normal",
    gestures: BIRD_GESTURES,
  },
  silver: {
    mouth: { x: 0.76, y: 0.7 },
    head: { x: 0.68, y: 0.42 },
    tail: { x: 0.1, y: 0.36 },
    groundY: 0.832,
    feather: "#9aa5b1",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
  bubbles: {
    mouth: { x: 0.8, y: 0.6 },
    head: { x: 0.52, y: 0.53 },
    tail: { x: 0.22, y: 0.68 },
    groundY: 0.88,
    feather: "#f2a92a",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
  melody: {
    mouth: { x: 0.58, y: 0.69 },
    head: { x: 0.5, y: 0.3 },
    tail: { x: 0.12, y: 0.78 },
    groundY: 0.892,
    feather: "#e8c08a",
    weight: "normal",
    gestures: BIRD_GESTURES,
  },
  willow: {
    mouth: { x: 0.6, y: 0.76 },
    head: { x: 0.45, y: 0.2 },
    tail: { x: 0.2, y: 0.75 },
    groundY: 0.824,
    feather: "#56a6db",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
  hatchlings: {
    mouth: { x: 0.505, y: 0.61 },
    head: { x: 0.5, y: 0.25 },
    tail: { x: 0.15, y: 0.6 },
    groundY: 0.888,
    feather: "#f0e4d2",
    weight: "light",
    gestures: BIRD_GESTURES,
  },
};

/**
 * The crewmate's anchors, in frame pixels. Its 36x44 body is drawn centred
 * at the bottom of the 76px frame (`AmongUsPet`), so the box is fixed.
 */
const CREWMATE_BOX = { left: 20, top: 24, width: 36, height: 44 } as const;

export function getPetRig(petId: PetId): PetRig {
  return PET_RIGS[petId];
}

export function getPetAnchorsPx(petId: PetId): PetAnchorsPx {
  const rig = getPetRig(petId);
  const pet = getPetById(petId);
  const box = pet.movementType === "walk" ? CREWMATE_BOX : getPetImageBox(pet);
  const toX = (fraction: number) => box.left + fraction * box.width;
  const toY = (fraction: number) => box.top + fraction * box.height;
  const mouthX = toX(rig.mouth.x);
  const mouthPercent = (mouthX / PET_ARTWORK_SIZE) * 100;

  return {
    mouthX,
    mouthY: toY(rig.mouth.y),
    headX: toX(rig.head.x),
    headY: toY(rig.head.y),
    tailX: toX(rig.tail.x),
    tailY: toY(rig.tail.y),
    groundY: toY(rig.groundY),
    pivotXPercent:
      FRAME_CENTER_PERCENT +
      Math.max(0, mouthPercent - FRAME_CENTER_PERCENT) * PIVOT_TOWARD_MOUTH,
  };
}

export function getGesturePalette(petId: PetId): GesturePalette {
  return Object.entries(getPetRig(petId).gestures).map(
    ([gesture, weight]) => [gesture as PetAmbientGesture, weight ?? 0] as const
  );
}

/**
 * Weighted pick that never repeats the previous gesture: the same move twice
 * in a row is the fastest way to make a pet read as a loop.
 */
export function pickGesture(
  palette: GesturePalette,
  previous: PetGesture,
  random: () => number = Math.random
): PetAmbientGesture {
  const candidates = palette.filter(([gesture]) => gesture !== previous);
  const pool = candidates.length > 0 ? candidates : palette;
  const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;

  for (const [gesture, weight] of pool) {
    roll -= weight;
    if (roll < 0) return gesture;
  }

  return pool[pool.length - 1][0];
}

export function getHopStyle(petId: PetId): HopStyle {
  return HOP_STYLES[getPetRig(petId).weight];
}

export function hasSignaturePlay(petId: PetId): boolean {
  return getPetRig(petId).playMs !== undefined;
}

export function getReactionDuration(petId: PetId, reaction: PetReaction): number {
  const rig = getPetRig(petId);

  if (reaction === "play") {
    return rig.playMs ?? LEGACY_PLAY_MS;
  }

  return Math.round(REACTION_BASE_MS[reaction] * WEIGHT_TIMING[rig.weight]);
}

export function getGestureDuration(petId: PetId, gesture: PetGesture): number {
  if (gesture === "none") return 0;
  if (gesture in LEGACY_GESTURE_MS) {
    return LEGACY_GESTURE_MS[gesture as keyof typeof LEGACY_GESTURE_MS];
  }

  const rig = getPetRig(petId);
  const base =
    gesture === "quirk"
      ? rig.quirkMs ?? DEFAULT_QUIRK_MS
      : GESTURE_BASE_MS[gesture as keyof typeof GESTURE_BASE_MS];

  return Math.round(base * WEIGHT_TIMING[rig.weight]);
}
