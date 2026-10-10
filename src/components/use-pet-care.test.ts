import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PetId } from "@/components/pet-artwork";
import { getReactionDuration } from "@/components/pet-rig";
import { usePetCare } from "@/components/use-pet-care";

function renderCare(petId: PetId) {
  return renderHook(({ pet }) => usePetCare(true, pet), {
    initialProps: { pet: petId },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePetCare reactions", () => {
  test("eating lasts exactly as long as the pet's eating sequence", () => {
    const { result } = renderCare("red");
    const duration = getReactionDuration("red", "eat");

    act(() => result.current.feed("cookie"));
    expect(result.current.reaction).toBe("eat");
    expect(result.current.treat).toBe("cookie");

    act(() => {
      vi.advanceTimersByTime(duration - 1);
    });
    expect(result.current.reaction).toBe("eat");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.reaction).toBeNull();
    expect(result.current.treat).toBeNull();
    expect(result.current.feedback).toMatch(/Best\. Crumb\. Ever\.|A very worthy cookie\./);
  });

  test("a pet with a signature move plays for that move's length", () => {
    const { result } = renderCare("red");

    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(getReactionDuration("red", "play") - 1);
    });

    expect(result.current.reaction).toBe("play");
  });

  test("heavier pets take longer to drink", () => {
    expect(getReactionDuration("terence", "drink")).toBeGreaterThan(
      getReactionDuration("chuck", "drink")
    );
  });

  test("the thank-you note clears on its own", () => {
    const { result } = renderCare("chuck");

    act(() => result.current.giveWater());
    act(() => {
      vi.advanceTimersByTime(getReactionDuration("chuck", "drink"));
    });
    expect(result.current.feedback).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2_300);
    });
    expect(result.current.feedback).toBeNull();
  });
});
