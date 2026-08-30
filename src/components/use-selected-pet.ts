"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_PET_ID,
  isPetId,
  PET_CHANGE_EVENT,
  PET_STORAGE_KEY,
  type PetId,
} from "@/components/pet-artwork";

export const PET_FOLLOW_CURSOR_STORAGE_KEY = "portfolio-pet-follow-cursor";
export const PET_FOLLOW_CURSOR_CHANGE_EVENT =
  "portfolio-pet-follow-cursor-change";

function getStoredPet(): PetId {
  if (typeof window === "undefined") {
    return DEFAULT_PET_ID;
  }

  const storedPet = window.localStorage.getItem(PET_STORAGE_KEY);
  return isPetId(storedPet) ? storedPet : DEFAULT_PET_ID;
}

function subscribeToPetChanges(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PET_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(PET_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(PET_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function getStoredFollowCursor(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(PET_FOLLOW_CURSOR_STORAGE_KEY) === "true";
}

function subscribeToPetFollowCursorChanges(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PET_FOLLOW_CURSOR_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(PET_FOLLOW_CURSOR_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(PET_FOLLOW_CURSOR_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useSelectedPet(): PetId {
  return useSyncExternalStore(
    subscribeToPetChanges,
    getStoredPet,
    () => DEFAULT_PET_ID
  );
}

export function usePetFollowCursor(): boolean {
  return useSyncExternalStore(
    subscribeToPetFollowCursorChanges,
    getStoredFollowCursor,
    () => false
  );
}

export function persistSelectedPet(petId: PetId) {
  window.localStorage.setItem(PET_STORAGE_KEY, petId);
  window.dispatchEvent(new CustomEvent(PET_CHANGE_EVENT));
}

export function persistPetFollowCursor(enabled: boolean) {
  window.localStorage.setItem(
    PET_FOLLOW_CURSOR_STORAGE_KEY,
    enabled ? "true" : "false"
  );
  window.dispatchEvent(new CustomEvent(PET_FOLLOW_CURSOR_CHANGE_EVENT));
}
