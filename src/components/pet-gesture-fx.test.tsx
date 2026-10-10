import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PetGestureFx } from "@/components/pet-gesture-fx";
import { getPetRig } from "@/components/pet-rig";

function count(kind: string) {
  return document.querySelectorAll(`[data-pet-fx='${kind}']`).length;
}

describe("PetGestureFx", () => {
  test("renders nothing while the pet is simply resting", () => {
    const { container } = render(<PetGestureFx petId="red" gesture={undefined} petted={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("scatters seeds in front of the beak to peck at", () => {
    render(<PetGestureFx petId="red" gesture="peck" petted={false} />);

    expect(count("seed")).toBe(3);
  });

  test("loses one feather while preening and two while fluffing, in its own colour", () => {
    const { unmount } = render(<PetGestureFx petId="red" gesture="preen" petted={false} />);
    expect(count("feather")).toBe(1);
    unmount();

    render(<PetGestureFx petId="red" gesture="fluff" petted={false} />);
    expect(count("feather")).toBe(2);
    const fill = document.querySelector("[data-pet-fx='feather'] path")?.getAttribute("fill");
    expect(fill).toBe(getPetRig("red").feather);
  });

  test("kicks up dust on each landing of a wander", () => {
    render(<PetGestureFx petId="chuck" gesture="wander" petted={false} />);

    expect(count("dust")).toBe(4);
  });

  test("lets off steam for Red's grumpy huff", () => {
    render(<PetGestureFx petId="red" gesture="quirk" petted={false} />);

    expect(count("steam")).toBe(2);
  });

  test("Chuck fidgets himself to sleep for a moment, then jolts awake", () => {
    render(<PetGestureFx petId="chuck" gesture="quirk" petted={false} />);

    expect(count("snooze")).toBe(1);
    expect(count("exclaim")).toBe(1);
  });

  test("shows a heart while being petted", () => {
    render(<PetGestureFx petId="red" gesture={undefined} petted />);

    expect(count("heart")).toBe(1);
  });
});
