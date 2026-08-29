"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_PET_ID,
  isPetId,
  PET_CHANGE_EVENT,
  PET_STORAGE_KEY,
  type PetId,
} from "@/components/pet-artwork";

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

export function useSelectedPet(): PetId {
  return useSyncExternalStore(
    subscribeToPetChanges,
    getStoredPet,
    () => DEFAULT_PET_ID
  );
}

export function persistSelectedPet(petId: PetId) {
  window.localStorage.setItem(PET_STORAGE_KEY, petId);
  window.dispatchEvent(new CustomEvent(PET_CHANGE_EVENT));
}
