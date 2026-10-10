import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PetCareScene } from "@/components/pet-care-scene";
import { getPetAnchorsPx } from "@/components/pet-rig";

function all(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

function centreX(element: HTMLElement) {
  return parseFloat(element.style.left) + parseFloat(element.style.width) / 2;
}

describe("PetCareScene: eating", () => {
  test("sets the treat down right in front of the beak, on the ground", () => {
    render(<PetCareScene petId="red" reaction="eat" treat="apple" />);
    const anchors = getPetAnchorsPx("red");

    const food = all("[data-pet-food]")[0];
    const foodBottom = parseFloat(food.style.top) + parseFloat(food.style.height);

    expect(centreX(food)).toBeGreaterThan(anchors.mouthX);
    expect(centreX(food)).toBeLessThan(anchors.mouthX + 10);
    expect(Math.abs(foodBottom - anchors.groundY)).toBeLessThan(2);
  });

  test("shows the treat whole, then bitten once, then twice", () => {
    render(<PetCareScene petId="red" reaction="eat" treat="cookie" />);

    const stages = all("[data-pet-food-stage]");

    expect(stages.map((stage) => stage.dataset.petFoodStage)).toEqual(["0", "1", "2"]);
    expect(stages.every((stage) => stage.textContent === "🍪")).toBe(true);
    expect(stages[0].style.maskImage ?? "").toBe("");
    expect(stages[1].style.maskImage).toContain("radial-gradient");
    expect(stages[2].style.maskImage.match(/radial-gradient/g)).toHaveLength(2);
  });

  test("throws three crumbs per peck in the treat's colours, then a heart", () => {
    render(<PetCareScene petId="red" reaction="eat" treat="berries" />);

    const crumbs = all("[data-pet-fx='crumb']");
    const colours = new Set(crumbs.map((crumb) => crumb.style.background));

    expect(crumbs).toHaveLength(9);
    expect(colours.size).toBe(2);
    expect(all("[data-pet-fx='heart']")).toHaveLength(1);
  });

  test("sits the food and bowl behind the bird so the beak overlaps them", () => {
    render(<PetCareScene petId="red" reaction="eat" treat="apple" />);

    expect(all("[data-pet-scene-layer='back']")[0].style.zIndex).toBe("-1");
  });
});

describe("PetCareScene: drinking", () => {
  test("brings a bowl to the beak with one ripple per sip and droplets for the head shake", () => {
    render(<PetCareScene petId="red" reaction="drink" treat={null} />);
    const anchors = getPetAnchorsPx("red");

    const bowl = all("[data-pet-bowl]")[0];

    expect(Math.abs(centreX(bowl) - anchors.mouthX)).toBeLessThan(8);
    expect(all("[data-pet-fx='ripple']")).toHaveLength(3);
    expect(all("[data-pet-fx='droplet']")).toHaveLength(3);
    expect(all("[data-pet-food]")).toHaveLength(0);
  });
});

describe("PetCareScene: playing", () => {
  test("Red plays its battle cry: sound waves from the beak, no sparkles", () => {
    render(<PetCareScene petId="red" reaction="play" treat={null} />);

    expect(all("[data-pet-fx='soundwave']")).toHaveLength(3);
    expect(all("[data-pet-play-sparkles]")).toHaveLength(0);
  });

  test("a pet without a signature move keeps the original sparkles", () => {
    render(<PetCareScene petId="bomb" reaction="play" treat={null} />);

    expect(all("[data-pet-play-sparkles] > span")).toHaveLength(3);
  });

  test("Chuck's speed burst trails speed lines both ways and skids up dust twice", () => {
    render(<PetCareScene petId="chuck" reaction="play" treat={null} />);

    const tracks = all("[data-pet-fx-track]");

    // One set of lines behind him on the way out, one on the way back.
    expect(tracks.map((track) => track.dataset.petFxTrack)).toEqual(["chuck-out", "chuck-back"]);
    expect(all("[data-pet-fx='speedline']")).toHaveLength(6);
    expect(all("[data-pet-fx='dust']")).toHaveLength(2);
    expect(all("[data-pet-play-sparkles]")).toHaveLength(0);
  });
});
