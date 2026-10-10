import { describe, expect, test } from "vitest";
import { PETS, getPetById, getPetImageBox } from "@/components/pet-artwork";
import {
  getGestureDuration,
  getGesturePalette,
  getHopStyle,
  getPetAnchorsPx,
  getPetRig,
  getReactionDuration,
  hasSignaturePlay,
  pickGesture,
} from "@/components/pet-rig";

const ANCHOR_MIN = -0.25;
const ANCHOR_MAX = 1.25;

describe("pet rigs", () => {
  test.each(PETS.map((pet) => pet.id))("%s has anchors inside its artwork", (petId) => {
    const rig = getPetRig(petId);

    for (const point of [rig.mouth, rig.head, rig.tail]) {
      expect(point.x).toBeGreaterThanOrEqual(ANCHOR_MIN);
      expect(point.x).toBeLessThanOrEqual(ANCHOR_MAX);
      expect(point.y).toBeGreaterThanOrEqual(ANCHOR_MIN);
      expect(point.y).toBeLessThanOrEqual(ANCHOR_MAX);
    }
    expect(rig.groundY).toBeGreaterThan(0.5);
    expect(rig.groundY).toBeLessThanOrEqual(1);
    expect(rig.feather).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("converts Red's beak anchor into pixels in the 76px frame", () => {
    const box = getPetImageBox(getPetById("red"));
    const rig = getPetRig("red");

    const anchors = getPetAnchorsPx("red");

    expect(anchors.mouthX).toBeCloseTo(box.left + rig.mouth.x * box.width, 5);
    expect(anchors.mouthY).toBeCloseTo(box.top + rig.mouth.y * box.height, 5);
    expect(anchors.groundY).toBeCloseTo(box.top + rig.groundY * box.height, 5);
    // The peck pivots ahead of centre, under the beak, and never past it.
    expect(anchors.pivotXPercent).toBeGreaterThan(50);
    expect(anchors.pivotXPercent).toBeLessThan((anchors.mouthX / 76) * 100);
  });

  test("anchors the crewmate to its drawn body rather than an image", () => {
    const anchors = getPetAnchorsPx("among-us");

    expect(anchors.groundY).toBe(68);
    expect(anchors.mouthX).toBeGreaterThan(38);
  });
});

describe("gesture palettes", () => {
  test("birds get the full bird repertoire, including the walk", () => {
    const palette = getGesturePalette("chuck").map(([gesture]) => gesture);

    expect(palette).toEqual(
      expect.arrayContaining(["look-around", "head-tilt", "peck", "preen", "fluff", "wander"])
    );
  });

  test("the crewmate is not a bird, so it never pecks, preens or hops off", () => {
    const palette = getGesturePalette("among-us").map(([gesture]) => gesture);

    expect(palette).not.toContain("peck");
    expect(palette).not.toContain("preen");
    expect(palette).not.toContain("fluff");
    expect(palette).not.toContain("wander");
  });

  test("Red has a personal quirk on top of the bird repertoire", () => {
    const palette = getGesturePalette("red").map(([gesture]) => gesture);

    expect(palette).toContain("quirk");
  });

  test("every weight in every palette is positive", () => {
    for (const pet of PETS) {
      for (const [, weight] of getGesturePalette(pet.id)) {
        expect(weight).toBeGreaterThan(0);
      }
    }
  });
});

describe("pickGesture", () => {
  const palette = [
    ["hop", 1],
    ["peck", 1],
    ["preen", 2],
  ] as const;

  test("draws by weight", () => {
    expect(pickGesture(palette, "none", () => 0)).toBe("hop");
    expect(pickGesture(palette, "none", () => 0.3)).toBe("peck");
    expect(pickGesture(palette, "none", () => 0.99)).toBe("preen");
  });

  test("never repeats the gesture it just did", () => {
    for (const roll of [0, 0.25, 0.5, 0.75, 0.999]) {
      expect(pickGesture(palette, "preen", () => roll)).not.toBe("preen");
    }
  });

  test("still returns something when the palette holds only the last gesture", () => {
    expect(pickGesture([["hop", 1]], "hop", () => 0.5)).toBe("hop");
  });
});

describe("durations", () => {
  test("eating and drinking are full sequences, not twitches", () => {
    expect(getReactionDuration("red", "eat")).toBeGreaterThanOrEqual(3000);
    expect(getReactionDuration("red", "drink")).toBeGreaterThanOrEqual(3000);
  });

  test("a pet with a signature move plays for that move's length", () => {
    expect(hasSignaturePlay("red")).toBe(true);
    expect(getReactionDuration("red", "play")).toBe(getPetRig("red").playMs);
  });

  test("a pet without one keeps the original play timing", () => {
    expect(hasSignaturePlay("bomb")).toBe(false);
    expect(getReactionDuration("bomb", "play")).toBe(1_350);
  });

  test("Chuck, the fastest bird on the island, has a speed burst and a restless quirk", () => {
    const palette = Object.fromEntries(getGesturePalette("chuck"));
    const redPalette = Object.fromEntries(getGesturePalette("red"));

    expect(hasSignaturePlay("chuck")).toBe(true);
    expect(palette.quirk).toBeGreaterThan(0);
    // Scatterbrained and unable to sit still: he looks about and wanders more.
    expect(palette["look-around"]).toBeGreaterThan(redPalette["look-around"]);
    expect(palette.wander).toBeGreaterThan(redPalette.wander);
  });

  test("the original gestures keep their original timing", () => {
    expect(getGestureDuration("terence", "hop")).toBe(620);
    expect(getGestureDuration("terence", "startle")).toBe(520);
  });

  test("heavier birds hop shorter, lower and slower", () => {
    const light = getHopStyle("chuck");
    const heavy = getHopStyle("terence");

    expect(heavy.stride).toBeLessThan(light.stride);
    expect(heavy.height).toBeLessThan(light.height);
    expect(heavy.durationMs).toBeGreaterThan(light.durationMs);
  });

  test("heavier pets move more slowly than lighter ones", () => {
    const light = getGestureDuration("chuck", "look-around");
    const heavy = getGestureDuration("terence", "look-around");

    expect(heavy).toBeGreaterThan(light);
  });
});
