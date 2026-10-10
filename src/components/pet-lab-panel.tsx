"use client";

import { isPetId, PETS, type PetId } from "@/components/pet-artwork";
import { getGesturePalette, type PetGesture } from "@/components/pet-rig";
import type { PetTreat } from "@/components/use-pet-care";
import { persistSelectedPet } from "@/components/use-selected-pet";

/**
 * Development-only review panel, opened with `?petlab` while `next dev` runs.
 *
 * Idle gestures fire on their own every 7–14s at random, which makes
 * reviewing one pet's animations painfully slow. This drives the real pet in
 * the corner — not a copy — so what you review is exactly what ships.
 * `PetCursor` only renders it when `NODE_ENV === "development"`, so production
 * bundles drop it.
 */

type PetLabPanelProps = {
  petId: PetId;
  busy: boolean;
  onGesture: (gesture: Exclude<PetGesture, "none">) => void;
  onFeed: (treat: PetTreat) => void;
  onWater: () => void;
  onPlay: () => void;
};

const ALWAYS_AVAILABLE: ReadonlyArray<Exclude<PetGesture, "none">> = ["yawn", "startle"];
const TREATS: ReadonlyArray<PetTreat> = ["apple", "berries", "cookie"];

const BUTTON =
  "rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

export function PetLabPanel({
  petId,
  busy,
  onGesture,
  onFeed,
  onWater,
  onPlay,
}: PetLabPanelProps) {
  const gestures = [
    ...getGesturePalette(petId).map(([gesture]) => gesture),
    ...ALWAYS_AVAILABLE,
  ];

  return (
    <div
      role="region"
      aria-label="Pet lab"
      className="not-prose fixed left-4 top-20 z-50 w-[248px] rounded-xl border border-border/75 bg-card/95 p-3 text-card-foreground shadow-lg backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">Pet lab</p>
        <select
          aria-label="Pet"
          value={petId}
          onChange={(event) => {
            const next = event.target.value;
            if (isPetId(next)) persistSelectedPet(next);
          }}
          className="rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[11px]"
        >
          {PETS.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Gestures</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {gestures.map((gesture) => (
          <button
            key={gesture}
            type="button"
            disabled={busy}
            className={BUTTON}
            onClick={() => onGesture(gesture)}
          >
            {gesture}
          </button>
        ))}
      </div>

      <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Care</p>
      <div className="flex flex-wrap gap-1">
        {TREATS.map((treat) => (
          <button
            key={treat}
            type="button"
            disabled={busy}
            className={BUTTON}
            onClick={() => onFeed(treat)}
          >
            eat {treat}
          </button>
        ))}
        <button type="button" disabled={busy} className={BUTTON} onClick={onWater}>
          drink
        </button>
        <button type="button" disabled={busy} className={BUTTON} onClick={onPlay}>
          play
        </button>
      </div>
    </div>
  );
}
