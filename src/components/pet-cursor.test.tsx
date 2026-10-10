import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import PetCursor from "@/components/pet-cursor";
import { PET_STORAGE_KEY } from "@/components/pet-artwork";
import { PET_FOLLOW_CURSOR_STORAGE_KEY } from "@/components/use-selected-pet";
import { setMediaMatches } from "@/test/browser-stubs";

/**
 * Characterization tests: they pin down how the pet behaves for a visitor
 * today, so the animation work layered on top cannot quietly change it.
 * They assert on behaviour (what is rendered, what reacts, what clears), not
 * on how long an animation takes, because those durations are allowed to
 * change.
 */

const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
const STEP_MS = 100;
const MAX_REACTION_MS = 10_000;

function getSprite() {
  return document.querySelector<HTMLElement>("[data-pet-cursor]");
}

function getReactionLayer() {
  return document.querySelector<HTMLElement>("[data-pet-reaction]");
}

/** Advance time until the current care reaction has finished. */
function finishReaction() {
  for (let elapsed = 0; elapsed < MAX_REACTION_MS; elapsed += STEP_MS) {
    if (!getReactionLayer()) return;
    act(() => {
      vi.advanceTimersByTime(STEP_MS);
    });
  }
  throw new Error("care reaction never finished");
}

function renderPet({ pet = "red", follow = false } = {}) {
  window.localStorage.setItem(PET_STORAGE_KEY, pet);
  window.localStorage.setItem(PET_FOLLOW_CURSOR_STORAGE_KEY, String(follow));
  const view = render(<PetCursor />);
  act(() => {
    vi.advanceTimersByTime(32);
  });
  return view;
}

function openCareMenu(petName = "Red") {
  fireEvent.click(screen.getByRole("button", { name: `Care for ${petName}` }));
  return screen.getByRole("dialog", { name: "Pet care" });
}

beforeEach(() => {
  vi.useFakeTimers();
  setMediaMatches(DESKTOP_POINTER_QUERY, true);
});

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

describe("PetCursor (static corner pet)", () => {
  test("renders nothing on devices without a fine hover pointer", () => {
    setMediaMatches(DESKTOP_POINTER_QUERY, false);

    renderPet();

    expect(getSprite()).toBeNull();
  });

  test("parks the selected pet in the corner with a care button", () => {
    renderPet({ pet: "red" });

    const sprite = getSprite();
    expect(sprite).toHaveAttribute("data-static-pet", "true");
    expect(sprite).toHaveAttribute("data-selected-pet", "red");
    expect(document.querySelector('[data-pet-image="red"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Care for Red" })).toBeVisible();
  });

  test("starts awake, grows drowsy, then falls asleep when the visitor is idle", () => {
    renderPet();
    expect(document.querySelector('[data-pet-idle="awake"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(20_500);
    });
    expect(document.querySelector('[data-pet-idle="drowsy"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(12_000);
    });
    expect(document.querySelector('[data-pet-idle="asleep"]')).not.toBeNull();
    expect(screen.getByText(/tiny power nap/)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(document.querySelector('[data-pet-idle="awake"]')).not.toBeNull();
  });

  test("toggles the care menu from the pet and closes it with Escape", () => {
    renderPet();

    const menu = openCareMenu();
    expect(menu).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Pet care" })).toBeNull();
  });

  test("eats a treat, then thanks the visitor", () => {
    renderPet();
    openCareMenu();

    fireEvent.click(screen.getByRole("button", { name: /Apple/ }));

    expect(screen.queryByRole("dialog", { name: "Pet care" })).toBeNull();
    expect(getReactionLayer()).toHaveAttribute("data-pet-reaction", "eat");

    finishReaction();

    expect(getReactionLayer()).toBeNull();
    expect(screen.getByText(/Crunchy\. Perfect\.|Apple-powered!/)).toBeInTheDocument();
  });

  test("drinks water, then thanks the visitor", () => {
    renderPet();
    openCareMenu();

    fireEvent.click(screen.getByRole("button", { name: /Water/ }));
    expect(getReactionLayer()).toHaveAttribute("data-pet-reaction", "drink");

    finishReaction();

    expect(screen.getByText(/Ahh, much better\.|Hydrated and happy!/)).toBeInTheDocument();
  });

  test("plays, then asks for more", () => {
    renderPet();
    openCareMenu();

    fireEvent.click(screen.getByRole("button", { name: /Play/ }));
    expect(getReactionLayer()).toHaveAttribute("data-pet-reaction", "play");

    finishReaction();

    expect(screen.getByText(/Again! Again!|Okay, that was awesome\./)).toBeInTheDocument();
  });

  test("asks for food on its own after a while", () => {
    renderPet();

    act(() => {
      vi.advanceTimersByTime(24_500);
    });

    expect(screen.getByText(/Tiny snack break/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose a treat/ })).toBeVisible();
  });
});

describe("PetCursor (follow-cursor mode)", () => {
  test("follows the cursor without the corner button or idle life", () => {
    renderPet({ follow: true });

    const sprite = getSprite();
    expect(sprite).toHaveAttribute("data-follow-cursor", "true");
    expect(screen.queryByRole("button", { name: /Care for/ })).toBeNull();
    expect(document.querySelector("[data-pet-idle]")).toBeNull();
    expect(document.querySelector("[data-pet-gesture]")).toBeNull();
  });

  test("appears on the first pointer move and starts travelling", () => {
    renderPet({ follow: true });
    expect(getSprite()).toHaveStyle({ opacity: "0" });

    act(() => {
      window.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 400, clientY: 300, pointerType: "mouse" })
      );
      vi.advanceTimersByTime(32);
    });

    expect(getSprite()).toHaveStyle({ opacity: "1" });
    expect(getSprite()).toHaveAttribute("data-flying", "true");
  });
});
