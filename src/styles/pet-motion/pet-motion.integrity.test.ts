import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { PETS } from "@/components/pet-artwork";
import {
  getGesturePalette,
  getPetRig,
  hasSignaturePlay,
  type PetGesture,
} from "@/components/pet-rig";
import { SIGNATURE_PLAY_FX, SIGNATURE_QUIRK_FX } from "@/components/pet-signatures";

/**
 * The pets' motion is split between TS (which gesture runs, for how long) and
 * CSS (what it looks like). Nothing type-checks across that line, so these
 * tests do: every gesture a pet can pick, every signature it can play and
 * every animation the CSS names must exist on the other side.
 */

// Comments are stripped so a commented-out rule can never satisfy a check.
function readStyles(file: string) {
  return readFileSync(join(process.cwd(), file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
}

const PET_MOTION_FILES = ["src/styles/pet-motion/core.css", "src/styles/pet-motion/signatures.css"];
const STYLES = [...PET_MOTION_FILES, "src/app/globals.css"].map(readStyles).join("\n");

const DEFINED_KEYFRAMES = new Set(
  [...STYLES.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1])
);

const FX_KINDS = [
  "crumb",
  "heart",
  "ripple",
  "droplet",
  "seed",
  "feather",
  "dust",
  "steam",
  "soundwave",
  "speedline",
  "snooze",
  "exclaim",
];

/** Split an `animation` list on its commas, but not those inside `cubic-bezier(…)`. */
function splitAnimationList(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  return [...parts, current];
}

function referencedKeyframes(): string[] {
  const names: string[] = [];
  for (const [, value] of STYLES.matchAll(/animation(?:-name)?:\s*([^;]+);/g)) {
    for (const part of splitAnimationList(value)) {
      const name = part.trim().split(/\s+/)[0];
      if (name && name !== "none") names.push(name);
    }
  }
  return names;
}

describe("pet motion CSS integrity", () => {
  test("every animation the CSS names is defined", () => {
    const missing = referencedKeyframes().filter((name) => !DEFINED_KEYFRAMES.has(name));

    expect(missing).toEqual([]);
  });

  test("every gesture any pet can perform has a motion rule", () => {
    const gestures = new Set<PetGesture>(
      PETS.flatMap((pet) => getGesturePalette(pet.id).map(([gesture]) => gesture))
    );
    gestures.add("yawn");
    gestures.add("startle");
    gestures.delete("quirk");

    for (const gesture of gestures) {
      expect(STYLES, `no rule for gesture "${gesture}"`).toContain(`[data-pet-gesture="${gesture}"]`);
    }
  });

  test("a pet with a signature move has both its motion and its props", () => {
    for (const pet of PETS.filter((candidate) => hasSignaturePlay(candidate.id))) {
      expect(STYLES).toContain(`[data-selected-pet="${pet.id}"] [data-pet-reaction="play"]`);
      expect(SIGNATURE_PLAY_FX[pet.id], `${pet.id} has no signature props`).toBeDefined();
    }
  });

  test("a pet with a quirk has both its motion and its props", () => {
    for (const pet of PETS.filter((candidate) => getPetRig(candidate.id).gestures.quirk)) {
      expect(STYLES).toContain(`[data-selected-pet="${pet.id}"] [data-pet-gesture="quirk"]`);
      expect(SIGNATURE_QUIRK_FX[pet.id], `${pet.id} has no quirk props`).toBeDefined();
    }
  });

  test("signature props never exist without the rig timing that plays them", () => {
    for (const pet of PETS.filter((candidate) => SIGNATURE_PLAY_FX[candidate.id])) {
      expect(getPetRig(pet.id).playMs).toBeGreaterThan(0);
    }
    for (const pet of PETS.filter((candidate) => SIGNATURE_QUIRK_FX[candidate.id])) {
      expect(getPetRig(pet.id).quirkMs).toBeGreaterThan(0);
    }
  });

  test("every prop kind has a style", () => {
    for (const kind of FX_KINDS) {
      expect(STYLES, `no style for prop "${kind}"`).toContain(`[data-pet-fx="${kind}"]`);
    }
  });

  test("everything new stands still under reduced motion", () => {
    const reduced = STYLES.split("@media (prefers-reduced-motion: reduce)").slice(1).join("\n");

    for (const selector of ["[data-pet-fx]", "[data-pet-food]", "[data-pet-bowl]", "[data-pet-wander]"]) {
      expect(reduced).toContain(selector);
    }
  });

  // A later file's rules beat an earlier file's reduced-motion block at equal
  // specificity, so each file must stop its own props, not rely on core.css.
  test.each(PET_MOTION_FILES)("%s stops its own animated props under reduced motion", (file) => {
    const css = readStyles(file);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)").slice(1).join("\n");

    if (css.includes('[data-pet-fx="')) expect(reduced).toContain("[data-pet-fx]");
    if (css.includes("[data-pet-fx-track=")) expect(reduced).toContain("[data-pet-fx-track]");
  });
});
