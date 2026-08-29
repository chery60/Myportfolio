"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Bird, Check, X } from "lucide-react";
import { DockIcon } from "@/components/magicui/dock";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPetById,
  PETS,
  PetArtwork,
  type PetId,
} from "@/components/pet-artwork";
import {
  persistSelectedPet,
  useSelectedPet,
} from "@/components/use-selected-pet";
import { cn } from "@/lib/utils";

export default function PetSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPet = useSelectedPet();
  const selectedPetOption = useMemo(() => getPetById(selectedPet), [selectedPet]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectPet = (petId: PetId) => {
    persistSelectedPet(petId);
  };

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-50 hidden sm:flex items-end justify-center bg-background/35 p-6 pb-24 backdrop-blur-sm md:items-center md:pb-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pet-selector-title"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) {
                setIsOpen(false);
              }
            }}
          >
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-[0_24px_90px_-32px_rgba(0,0,0,0.55)] backdrop-blur-3xl dark:bg-card/90">
              <div className="flex items-center justify-between gap-3 px-1 pb-3">
                <div>
                  <h2
                    id="pet-selector-title"
                    className="text-base font-semibold"
                  >
                    Pets
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedPetOption.name}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close pet selector"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid max-h-[min(68vh,560px)] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                {PETS.map((pet) => {
                  const isSelected = pet.id === selectedPet;

                  return (
                    <button
                      key={pet.id}
                      type="button"
                      data-pet-choice={pet.id}
                      aria-pressed={isSelected}
                      className={cn(
                        "relative flex h-36 flex-col items-center justify-between rounded-lg border bg-background p-3 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary ring-2 ring-primary/15"
                          : "border-border"
                      )}
                      onClick={() => selectPet(pet.id)}
                    >
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border border-border bg-card text-transparent">
                        {isSelected ? (
                          <Check className="size-3.5 text-primary" />
                        ) : null}
                      </span>
                      <span className="flex h-24 w-full items-center justify-center overflow-visible">
                        <PetArtwork petId={pet.id} preview />
                      </span>
                      <span className="w-full min-w-0">
                        <span className="block truncate text-sm font-medium leading-tight">
                          {pet.name}
                        </span>
                        <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                          {pet.family}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Pets, selected ${selectedPetOption.name}`}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="hidden sm:inline-flex"
            onClick={() => setIsOpen(true)}
          >
            <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
              <Bird className="size-full rounded-sm overflow-hidden object-contain" />
            </DockIcon>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
        >
          <p>Pets</p>
          <TooltipArrow className="fill-primary" />
        </TooltipContent>
      </Tooltip>

      {modal}
    </>
  );
}
