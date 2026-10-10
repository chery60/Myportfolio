import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PetId } from "@/components/pet-artwork";
import { getGestureDuration, getGesturePalette, type PetGesture } from "@/components/pet-rig";
import { usePetIdle } from "@/components/use-pet-idle";

const SAMPLE_MS = 100;
const KEEP_AWAKE_EVERY_MS = 10_000;
const DROWSY_AFTER_MS = 20_000;

function renderIdle(enabled: boolean, petId: PetId) {
  const view = renderHook(({ on, pet }) => usePetIdle(on, pet), {
    initialProps: { on: enabled, pet: petId },
  });
  act(() => {
    vi.advanceTimersByTime(16);
  });
  return view;
}

/** Watch the pet for a while, keeping it awake, and record each new gesture. */
function collectGestures(read: () => PetGesture, durationMs: number) {
  const seen: PetGesture[] = [];
  let last: PetGesture = "none";
  for (let elapsed = 0; elapsed < durationMs; elapsed += SAMPLE_MS) {
    if (elapsed % KEEP_AWAKE_EVERY_MS === 0) {
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      });
    }
    act(() => {
      vi.advanceTimersByTime(SAMPLE_MS);
    });
    const now = read();
    if (now !== last && now !== "none" && now !== "startle") seen.push(now);
    last = now;
  }
  return seen;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePetIdle gestures", () => {
  test("only ever picks gestures from the pet's own palette", () => {
    const { result } = renderIdle(true, "among-us");
    const palette = getGesturePalette("among-us").map(([gesture]) => gesture);

    const seen = collectGestures(() => result.current.gesture, 240_000);

    expect(seen.length).toBeGreaterThan(5);
    for (const gesture of seen) {
      expect(palette).toContain(gesture);
    }
  });

  test("never does the same ambient gesture twice in a row", () => {
    const { result } = renderIdle(true, "red");

    const seen = collectGestures(() => result.current.gesture, 240_000);

    for (let index = 1; index < seen.length; index += 1) {
      expect(seen[index]).not.toBe(seen[index - 1]);
    }
  });

  test("yawns as it grows drowsy", () => {
    const { result } = renderIdle(true, "red");

    act(() => {
      vi.advanceTimersByTime(DROWSY_AFTER_MS + 10);
    });

    expect(result.current.phase).toBe("drowsy");
    expect(result.current.gesture).toBe("yawn");
  });

  test("can be told to perform a gesture, which ends on its own", () => {
    const { result } = renderIdle(true, "red");

    act(() => result.current.trigger("preen"));
    expect(result.current.gesture).toBe("preen");

    act(() => {
      vi.advanceTimersByTime(getGestureDuration("red", "preen") + 10);
    });
    expect(result.current.gesture).toBe("none");
  });

  test("is inert while disabled, whatever it is told", () => {
    const { result } = renderIdle(false, "red");

    act(() => result.current.trigger("preen"));

    expect(result.current).toMatchObject({ phase: "awake", gesture: "none", eyes: "open" });
  });
});
