"use client";

import dynamic from "next/dynamic";
import { MessageCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { usePetFollowCursor } from "@/components/use-selected-pet";
import { setPetChatOpen, togglePetChat, usePetChatOpen } from "@/components/use-pet-chat";
import { setPetParked } from "@/components/use-pet-parked";
import { FIRST_NAME } from "@/lib/assistant-persona";
import { cn } from "@/lib/utils";

/** The same gate `PetCursor` and `PetGreeting` use. */
const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Loaded on demand, never on first paint.
 *
 * The panel pulls in `ai`, `@ai-sdk/google` and `streamdown` — far more
 * JavaScript than the rest of this site combined. Shipping that to every
 * visitor to pay for a widget most will never open would cost more than the
 * feature is worth on a design portfolio, so it lives in its own chunk.
 */
const PetChatPanel = dynamic(
  () => import("@/components/pet-chat-panel").then((m) => m.PetChatPanel),
  { ssr: false }
);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export default function PetChatLauncher() {
  const chatOpen = usePetChatOpen();
  const followCursor = usePetFollowCursor();
  const isDesktop = useMediaQuery(DESKTOP_POINTER_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Hold the pet still under the bubble for as long as the chat is open. The
  // reason key means closing the chat cannot unpark a pet the case-study
  // greeting is still using.
  useEffect(() => {
    setPetParked(chatOpen, "chat");
    return () => setPetParked(false, "chat");
  }, [chatOpen]);

  const close = () => {
    setPetChatOpen(false);
    triggerRef.current?.focus();
  };

  const label = `Chat with ${FIRST_NAME}'s assistant`;

  // In static mode on desktop the sprite itself is the button — that lives in
  // `pet-cursor.tsx`, where the sprite's geometry is defined. This component
  // covers the two cases that sprite cannot: a pet roaming after the cursor,
  // and mobile, where there is no pet at all — just a plain chat button.
  const needsOwnTrigger = !isDesktop || followCursor;

  return (
    <>
      {needsOwnTrigger && !chatOpen ? (
        <button
          ref={triggerRef}
          type="button"
          data-pet-chat-trigger
          onClick={togglePetChat}
          aria-haspopup="dialog"
          aria-expanded={chatOpen}
          aria-controls="pet-chat-panel"
          aria-label={label}
          className={cn(
            "fixed z-30 flex items-center justify-center rounded-full",
            "border border-border bg-card text-muted-foreground",
            "shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)] transition-colors",
            "hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isDesktop
              ? "bottom-6 right-6 size-11"
              : // Clears the Navbar dock, which occupies roughly 16–72px.
                "bottom-20 right-4 size-14"
          )}
        >
          <MessageCircleIcon className={isDesktop ? "size-5" : "size-6"} />
        </button>
      ) : null}

      {chatOpen ? (
        <PetChatPanel
          onClose={close}
          isDesktop={isDesktop}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </>
  );
}
