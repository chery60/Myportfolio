"use client";

import { useSyncExternalStore } from "react";

export const PET_PARKED_CHANGE_EVENT = "portfolio-pet-parked-change";

/**
 * Where the pet parks while it is speaking.
 *
 * The static pet sits at `bottom-6 right-6` inside a 76px box, so its
 * bottom-centre is 24 + 76/2 = 62px from the right edge and 24px from the
 * bottom. Follow-cursor mode positions the sprite by its bottom-centre too,
 * which is why parking at this exact point lands the pet in the same place in
 * both modes — and therefore under the same speech bubble.
 *
 * `PET_BUBBLE_OFFSET_BOTTOM` is the matching anchor for the bubble: the 24px
 * inset, plus the 76px box, plus an 8px gap.
 */
export const PET_PARK_OFFSET_RIGHT = 62;
export const PET_PARK_OFFSET_BOTTOM = 24;
export const PET_BUBBLE_OFFSET_BOTTOM = 24 + 76 + 8;

/**
 * Why parking is a *set* of reasons and not a single flag.
 *
 * Two independent features need the pet held still, and they can overlap: the
 * case-study walkthrough greeting, and the assistant chat. With one boolean,
 * whichever of them unmounted last would unpark the pet out from under the
 * other — close the chat while the greeting is up and the pet walks off
 * mid-sentence. The pet now stays parked while *any* reason is held.
 */
export type PetParkReason = "greeting" | "chat";

// Ephemeral on purpose: parking is a property of the current page view, not a
// preference, so it must not survive a reload the way the pet choice does.
const parkReasons = new Set<PetParkReason>();
let parked = false;

function subscribe(onStoreChange: () => void) {
  window.addEventListener(PET_PARKED_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(PET_PARKED_CHANGE_EVENT, onStoreChange);
}

function getSnapshot(): boolean {
  return parked;
}

export function usePetParked(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function setPetParked(next: boolean, reason: PetParkReason) {
  if (next) {
    parkReasons.add(reason);
  } else {
    parkReasons.delete(reason);
  }

  const shouldPark = parkReasons.size > 0;
  if (parked === shouldPark) {
    return;
  }

  parked = shouldPark;
  window.dispatchEvent(new CustomEvent(PET_PARKED_CHANGE_EVENT));
}
