"use client";

import { useSyncExternalStore } from "react";

export const PET_CHAT_CHANGE_EVENT = "portfolio-pet-chat-change";

// Ephemeral on purpose, exactly like `use-pet-parked`: an open conversation is a
// property of the current page view, not a preference, so it must not survive a
// reload the way the pet choice does.
let open = false;

function subscribe(onStoreChange: () => void) {
  window.addEventListener(PET_CHAT_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(PET_CHAT_CHANGE_EVENT, onStoreChange);
}

function getSnapshot(): boolean {
  return open;
}

export function usePetChatOpen(): boolean {
  // The third argument is the server snapshot. It is required here because the
  // GitHub Pages build prerenders every page, and `useSyncExternalStore` throws
  // during that render without it.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function setPetChatOpen(next: boolean) {
  if (open === next) {
    return;
  }

  open = next;
  window.dispatchEvent(new CustomEvent(PET_CHAT_CHANGE_EVENT));
}

export function togglePetChat() {
  setPetChatOpen(!open);
}
