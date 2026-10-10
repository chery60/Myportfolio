"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PetId } from "@/components/pet-artwork";
import { getReactionDuration, type PetReaction } from "@/components/pet-rig";

export type { PetReaction };
export type PetNeed = "food" | "water";
export type PetTreat = "apple" | "berries" | "cookie";

const FIRST_REQUEST_MIN_MS = 16_000;
const FIRST_REQUEST_MAX_MS = 24_000;
const NEXT_REQUEST_MIN_MS = 95_000;
const NEXT_REQUEST_MAX_MS = 150_000;
const REQUEST_VISIBLE_MS = 14_000;

const TREAT_FEEDBACK: Record<PetTreat, string[]> = {
  apple: ["Crunchy. Perfect.", "Apple-powered!"],
  berries: ["Tiny berries, huge joy.", "That was berry good."],
  cookie: ["Best. Crumb. Ever.", "A very worthy cookie."],
};

const WATER_FEEDBACK = ["Ahh, much better.", "Hydrated and happy!"];
const PLAY_FEEDBACK = ["Again! Again!", "Okay, that was awesome."];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * A deliberately small care loop for the parked pet.
 *
 * Needs are invitations rather than meters: nothing decays, no visitor is
 * punished for ignoring one, and the prompt quietly leaves after a short
 * window. That keeps the pet feeling alive without turning a portfolio into a
 * tamagotchi dashboard.
 */
export function usePetCare(enabled: boolean, petId: PetId) {
  const [need, setNeed] = useState<PetNeed | null>(null);
  const [reaction, setReaction] = useState<PetReaction | null>(null);
  const [treat, setTreat] = useState<PetTreat | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const requestCountRef = useRef(0);
  const reactionTimerRef = useRef<number | undefined>(undefined);
  const feedbackTimerRef = useRef<number | undefined>(undefined);
  // Read when a reaction starts, so `react` stays referentially stable.
  const petIdRef = useRef<PetId>(petId);

  useEffect(() => {
    petIdRef.current = petId;
  }, [petId]);

  useEffect(() => {
    if (!enabled) {
      const resetFrame = window.requestAnimationFrame(() => setNeed(null));
      return () => window.cancelAnimationFrame(resetFrame);
    }

    let requestTimer: number | undefined;
    let dismissTimer: number | undefined;
    let cancelled = false;

    const scheduleRequest = () => {
      const first = requestCountRef.current === 0;
      requestTimer = window.setTimeout(
        () => {
          if (cancelled) return;
          const nextNeed: PetNeed = requestCountRef.current % 2 === 0
            ? "food"
            : "water";
          requestCountRef.current += 1;
          setNeed(nextNeed);
          dismissTimer = window.setTimeout(() => {
            setNeed(null);
            scheduleRequest();
          }, REQUEST_VISIBLE_MS);
        },
        randomBetween(
          first ? FIRST_REQUEST_MIN_MS : NEXT_REQUEST_MIN_MS,
          first ? FIRST_REQUEST_MAX_MS : NEXT_REQUEST_MAX_MS
        )
      );
    };

    scheduleRequest();

    return () => {
      cancelled = true;
      window.clearTimeout(requestTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [enabled]);

  useEffect(() => {
    return () => {
      window.clearTimeout(reactionTimerRef.current);
      window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const react = useCallback((next: PetReaction, nextTreat?: PetTreat) => {
    window.clearTimeout(reactionTimerRef.current);
    window.clearTimeout(feedbackTimerRef.current);

    setNeed(null);
    setFeedback(null);
    setTreat(nextTreat ?? null);
    setReaction(next);

    reactionTimerRef.current = window.setTimeout(() => {
      setReaction(null);
      setTreat(null);

      const message = next === "eat" && nextTreat
        ? pick(TREAT_FEEDBACK[nextTreat])
        : next === "drink"
          ? pick(WATER_FEEDBACK)
          : pick(PLAY_FEEDBACK);

      setFeedback(message);
      feedbackTimerRef.current = window.setTimeout(
        () => setFeedback(null),
        2_300
      );
    }, getReactionDuration(petIdRef.current, next));
  }, []);

  return {
    need,
    reaction,
    treat,
    feedback,
    dismissNeed: () => setNeed(null),
    feed: (nextTreat: PetTreat) => react("eat", nextTreat),
    giveWater: () => react("drink"),
    play: () => react("play"),
  };
}
