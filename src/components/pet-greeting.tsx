"use client";

import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PetArtwork } from "@/components/pet-artwork";
import { usePetChatOpen } from "@/components/use-pet-chat";
import { useSelectedPet } from "@/components/use-selected-pet";
import {
  PET_BUBBLE_OFFSET_BOTTOM,
  setPetParked,
} from "@/components/use-pet-parked";
import { WalkthroughModal } from "@/components/walkthrough-modal";
import { cn } from "@/lib/utils";

/** Same gate `PetCursor` uses — below this, there is no pet on screen at all. */
const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
/** How far down the page counts as "started reading". */
const SCROLL_TRIGGER_PX = 420;
/** Small beat after the threshold so the bubble doesn't pop mid-flick. */
const SETTLE_DELAY_MS = 400;
/** A page too short to scroll would never greet; offer it on a timer instead. */
const NO_SCROLL_FALLBACK_MS = 2500;
const SESSION_KEY_PREFIX = "portfolio-walkthrough-greeted:";

interface Props {
  /** Used to remember, per browser session, that this project already greeted. */
  slug: string;
  /** YouTube video id from the post's `walkthroughId`. */
  videoId: string;
  title: string;
  /** From the post's `walkthroughDuration`, e.g. "4:32". */
  duration?: string;
}

function alreadyGreeted(slug: string) {
  try {
    return window.sessionStorage.getItem(SESSION_KEY_PREFIX + slug) === "1";
  } catch {
    // Private mode / blocked storage: greet anyway rather than stay silent.
    return false;
  }
}

function rememberGreeted(slug: string) {
  try {
    window.sessionStorage.setItem(SESSION_KEY_PREFIX + slug, "1");
  } catch {
    // Non-fatal — the greeting just repeats on the next navigation.
  }
}

/**
 * The pet offers the full walkthrough when a visitor lands on a case study.
 *
 * On desktop the bubble is anchored to the spot the pet parks in, so it reads
 * as the pet talking whether the pet is sitting in its corner or chasing the
 * cursor. Below the desktop gate `PetCursor` renders nothing, so this draws its
 * own sprite beside the message instead — the walkthrough must stay reachable
 * on a phone.
 */
export function PetGreeting({ slug, videoId, title, duration }: Props) {
  const selectedPet = useSelectedPet();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const chatOpen = usePetChatOpen();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  // The pet waits until the visitor has actually started reading before it
  // chimes in — a suggestion once you're into the piece, not an interruption
  // the moment the page paints.
  useEffect(() => {
    if (alreadyGreeted(slug)) {
      return;
    }

    let settleTimer = 0;
    let fallbackTimer = 0;

    const reveal = () => {
      rememberGreeted(slug);
      setShowBubble(true);
    };

    const handleScroll = () => {
      if (window.scrollY < SCROLL_TRIGGER_PX) {
        return;
      }

      window.removeEventListener("scroll", handleScroll);
      settleTimer = window.setTimeout(reveal, SETTLE_DELAY_MS);
    };

    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight >
      SCROLL_TRIGGER_PX;

    if (scrollable) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Covers a reload that restores a scrolled position.
      handleScroll();
    } else {
      fallbackTimer = window.setTimeout(reveal, NO_SCROLL_FALLBACK_MS);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(settleTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [slug]);

  // The greeting and the assistant chat render at the same z-index, anchored to
  // the same corner. Stacking them is visual mush, and an explicit click on the
  // pet is a stronger signal of intent than a scroll-triggered suggestion, so
  // the greeting steps aside. It hides rather than unmounts, so the offer comes
  // back if the visitor closes the chat without asking anything.
  const visible = showBubble && !modalOpen && !chatOpen;

  // The pet only holds still while the bubble is actually up. Leaving the page
  // releases the reason too, so the pet is never stranded.
  useEffect(() => {
    setPetParked(visible, "greeting");
    return () => setPetParked(false, "greeting");
  }, [visible]);

  // Gated on `visible`, not `showBubble`: while the chat has the corner, Escape
  // belongs to the chat. Without this, dismissing the chat would also silently
  // retire a greeting the visitor never actually saw.
  useEffect(() => {
    if (!visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowBubble(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Closing the video retires the greeting; the offer has been answered.
      setShowBubble(false);
    }
  };

  return (
    <>
      {visible && (
        <div
          className={cn(
            "not-prose fixed right-4 z-40 flex max-w-[min(20rem,calc(100vw-2rem))] items-end gap-2 sm:right-6",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          )}
          style={{ bottom: isDesktop ? PET_BUBBLE_OFFSET_BOTTOM : 96 }}
          role="status"
        >
          {/* Mobile has no PetCursor, so the greeting brings its own pet. */}
          {!isDesktop && (
            <div className="shrink-0" aria-hidden="true">
              <PetArtwork petId={selectedPet} />
            </div>
          )}

          <div className="relative rounded-2xl border border-border bg-card px-3 py-2.5 text-card-foreground shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]">
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              aria-label="Dismiss"
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XIcon className="size-3.5" />
            </button>

            <p className="pr-3 text-sm font-medium leading-snug">
              Psst — I&rsquo;d watch this one.
            </p>
            <p className="pr-3 text-xs leading-snug text-muted-foreground">
              The whole story, start to finish
              {duration ? `, in ${duration}` : ""}.
            </p>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1.5 text-sm font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Play the walkthrough →
            </button>

            {/* Tail, pointing down at the pet in its corner. */}
            {isDesktop && (
              <span
                aria-hidden="true"
                className="absolute -bottom-[7px] right-7 size-3 rotate-45 border-b border-r border-border bg-card"
              />
            )}
          </div>
        </div>
      )}

      <WalkthroughModal
        open={modalOpen}
        onOpenChange={handleOpenChange}
        videoId={videoId}
        title={title}
        duration={duration}
      />
    </>
  );
}
