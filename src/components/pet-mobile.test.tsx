import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import PetChatLauncher from "@/components/pet-chat-launcher";
import { PetChatPanel } from "@/components/pet-chat-panel";
import { PetGreeting } from "@/components/pet-greeting";
import { setMediaMatches } from "@/test/browser-stubs";

/**
 * Below the desktop gate there is no pet on screen at all. The features the
 * pet fronts on desktop — the assistant chat and the case-study walkthrough —
 * still have to be reachable on a phone, just without a sprite attached.
 */

const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
/** Past the greeting's no-scroll fallback (2.5s) plus its own render. */
const GREETING_WAIT_MS = 3_000;

function getPetArtwork() {
  return document.querySelector("[data-pet-artwork]");
}

describe("mobile: no pet", () => {
  test("the chat launcher opens the chat without drawing the pet", () => {
    render(<PetChatLauncher />);

    expect(
      screen.getByRole("button", { name: /assistant/i }),
    ).toBeInTheDocument();
    expect(getPetArtwork()).toBeNull();
  });

  test("the chat panel header has no pet on mobile", () => {
    render(<PetChatPanel onClose={vi.fn()} isDesktop={false} reducedMotion />);

    expect(screen.getByText(/portfolio guide/i)).toBeInTheDocument();
    expect(getPetArtwork()).toBeNull();
  });

  describe("case-study greeting", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      window.sessionStorage.clear();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("offers the walkthrough without drawing the pet", () => {
      render(<PetGreeting slug="mobile-test" videoId="abc123" title="Demo" />);
      act(() => {
        vi.advanceTimersByTime(GREETING_WAIT_MS);
      });

      expect(
        screen.getByRole("button", { name: /play the walkthrough/i }),
      ).toBeInTheDocument();
      expect(getPetArtwork()).toBeNull();
    });
  });
});

describe("desktop: pet stays", () => {
  test("the chat panel header still shows the pet", () => {
    setMediaMatches(DESKTOP_POINTER_QUERY, true);

    render(<PetChatPanel onClose={vi.fn()} isDesktop reducedMotion />);

    expect(getPetArtwork()).not.toBeNull();
  });
});
