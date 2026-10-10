"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PetId } from "@/components/pet-artwork";
import {
  getGestureDuration,
  getGesturePalette,
  pickGesture,
  type PetGesture,
} from "@/components/pet-rig";

/**
 * Idle life for the parked pet.
 *
 * When the pet is not following the cursor it used to sit in the corner as a
 * dead image. This drives three phases off real visitor inactivity — awake,
 * drowsy, then asleep — plus occasional one-shot gestures while awake, so the
 * pet reads as alive without ever demanding attention.
 *
 * Everything here is state only. The motion itself lives in `globals.css`,
 * keyed off the data attributes `pet-cursor.tsx` writes, which is the same
 * split the walk and flight animations already use.
 */
export type PetIdlePhase = "awake" | "drowsy" | "asleep";
/** Which gestures a pet picks, and how long each lasts, is per pet: see `pet-rig.ts`. */
export type PetIdleGesture = PetGesture;
/** How far the eyelids are down. `half` is the drowsy resting pose. */
export type PetEyes = "open" | "half" | "closed";

/**
 * Blink timings, taken from animation practice rather than physiology: a real
 * blink is ~570ms, which reads as a slow wince on screen. ~250ms total is the
 * convention, and the close must be faster than the open or it looks sleepy.
 * The close/open durations themselves live in globals.css; this is only how
 * long the eyes stay shut.
 */
const BLINK_HOLD_MS = 42;
const DROWSY_BLINK_HOLD_MS = 190;
/** Roughly 17 blinks a minute at rest, jittered so it never reads as a metronome. */
const BLINK_MIN_GAP_MS = 2_600;
const BLINK_MAX_GAP_MS = 6_000;
/** Humans blink twice in quick succession fairly often; so should a pet. */
const DOUBLE_BLINK_CHANCE = 0.16;
const DOUBLE_BLINK_GAP_MS = 190;

/** Quiet spells long enough to read as "nobody is here right now". */
const DROWSY_AFTER_MS = 20_000;
const ASLEEP_AFTER_MS = 32_000;

/** How often an awake pet does something small and unprompted. */
const GESTURE_MIN_DELAY_MS = 7_000;
const GESTURE_MAX_DELAY_MS = 14_000;

/** Anything that means a human is still on the page. */
const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "scroll",
  "touchstart",
] as const;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function usePetIdle(
  enabled: boolean,
  petId: PetId
): {
  phase: PetIdlePhase;
  gesture: PetIdleGesture;
  eyes: PetEyes;
  /** Perform a gesture now. Does nothing while the idle machine is disabled. */
  trigger: (gesture: Exclude<PetIdleGesture, "none">) => void;
} {
  const [phase, setPhase] = useState<PetIdlePhase>("awake");
  const [gesture, setGesture] = useState<PetIdleGesture>("none");
  const [eyes, setEyes] = useState<PetEyes>("open");

  // The ref, not the state, is what the timers read. Keeping the current phase
  // out of the effect's dependencies is what stops the timer chain being torn
  // down and rebuilt every time the pet nods off. It is only ever written from
  // inside the effect, never during render.
  const phaseRef = useRef<PetIdlePhase>("awake");
  // Same reasoning for the pet: switching pets changes the palette the next
  // gesture is drawn from without restarting the sleep countdown.
  const petIdRef = useRef<PetId>(petId);
  const lastGestureRef = useRef<PetIdleGesture>("none");
  const triggerRef = useRef<(next: Exclude<PetIdleGesture, "none">) => void>(
    () => {}
  );

  useEffect(() => {
    petIdRef.current = petId;
  }, [petId]);

  useEffect(() => {
    if (!enabled) {
      // No state write here: the hook's return value is guarded on `enabled`,
      // so a stale phase can never be observed while the pet is following the
      // cursor. Re-enabling resets it on the next frame, below.
      phaseRef.current = "awake";
      return;
    }

    const applyPhase = (next: PetIdlePhase) => {
      if (phaseRef.current === next) {
        return;
      }
      const previous = phaseRef.current;
      phaseRef.current = next;
      setPhase(next);
      setEyes(next === "asleep" ? "closed" : next === "drowsy" ? "half" : "open");
      // Animals yawn on the way down, not out of nowhere: it is the one cue
      // that tells the visitor the pet is getting sleepy before its eyes close.
      if (previous === "awake" && next === "drowsy") {
        runGesture("yawn");
      }
    };

    let drowsyTimer: number | undefined;
    let sleepTimer: number | undefined;
    let gestureTimer: number | undefined;
    let gestureEndTimer: number | undefined;
    let blinkTimer: number | undefined;
    let blinkHoldTimer: number | undefined;

    // A function declaration so `applyPhase` above can call it: both are only
    // invoked after this effect body has finished running.
    function runGesture(next: Exclude<PetIdleGesture, "none">) {
      lastGestureRef.current = next;
      setGesture(next);
      window.clearTimeout(gestureEndTimer);
      gestureEndTimer = window.setTimeout(() => {
        setGesture("none");
      }, getGestureDuration(petIdRef.current, next));
    }

    const scheduleAmbientGesture = () => {
      window.clearTimeout(gestureTimer);
      gestureTimer = window.setTimeout(() => {
        // A sleeping pet keeps still; it will pick this back up on waking.
        if (phaseRef.current === "awake") {
          runGesture(
            pickGesture(
              getGesturePalette(petIdRef.current),
              lastGestureRef.current
            )
          );
        }
        scheduleAmbientGesture();
      }, randomBetween(GESTURE_MIN_DELAY_MS, GESTURE_MAX_DELAY_MS));
    };

    triggerRef.current = runGesture;

    /** The lid position the pet returns to between blinks. */
    const restingEyes = (): PetEyes =>
      phaseRef.current === "asleep"
        ? "closed"
        : phaseRef.current === "drowsy"
          ? "half"
          : "open";

    const blink = (onDone?: () => void) => {
      setEyes("closed");
      window.clearTimeout(blinkHoldTimer);
      blinkHoldTimer = window.setTimeout(
        () => {
          setEyes(restingEyes());
          onDone?.();
        },
        phaseRef.current === "drowsy" ? DROWSY_BLINK_HOLD_MS : BLINK_HOLD_MS
      );
    };

    const scheduleBlink = () => {
      window.clearTimeout(blinkTimer);
      // A drowsy pet blinks slower and less often, which is most of what
      // "getting sleepy" looks like before the eyes actually close.
      const stretch = phaseRef.current === "drowsy" ? 1.7 : 1;
      blinkTimer = window.setTimeout(
        () => {
          if (phaseRef.current !== "asleep") {
            blink(() => {
              if (Math.random() < DOUBLE_BLINK_CHANCE) {
                window.setTimeout(() => blink(), DOUBLE_BLINK_GAP_MS);
              }
            });
          }
          scheduleBlink();
        },
        randomBetween(BLINK_MIN_GAP_MS, BLINK_MAX_GAP_MS) * stretch
      );
    };

    const startSleepCountdown = () => {
      window.clearTimeout(drowsyTimer);
      window.clearTimeout(sleepTimer);
      drowsyTimer = window.setTimeout(() => applyPhase("drowsy"), DROWSY_AFTER_MS);
      sleepTimer = window.setTimeout(() => applyPhase("asleep"), ASLEEP_AFTER_MS);
    };

    const wake = () => {
      // Being woken from a real sleep is worth a small startled hop; being
      // merely drowsy is not, or the pet would twitch constantly.
      if (phaseRef.current === "asleep") {
        runGesture("startle");
      }
      applyPhase("awake");
      startSleepCountdown();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, wake, { passive: true });
    }

    // Deferred by a frame rather than set synchronously, so re-enabling does
    // not cascade a second render out of this effect. Same reason the cursor's
    // own visibility reset is written inside a rAF.
    const resetFrame = window.requestAnimationFrame(() => {
      applyPhase("awake");
      setGesture("none");
      setEyes("open");
    });

    startSleepCountdown();
    scheduleAmbientGesture();
    scheduleBlink();

    return () => {
      triggerRef.current = () => {};
      window.cancelAnimationFrame(resetFrame);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, wake);
      }
      window.clearTimeout(drowsyTimer);
      window.clearTimeout(sleepTimer);
      window.clearTimeout(gestureTimer);
      window.clearTimeout(gestureEndTimer);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(blinkHoldTimer);
    };
  }, [enabled]);

  const trigger = useCallback(
    (next: Exclude<PetIdleGesture, "none">) => triggerRef.current(next),
    []
  );

  // Guarded rather than reset: while the pet follows the cursor it is never
  // idle, whatever the machine above happens to be holding.
  return enabled
    ? { phase, gesture, eyes, trigger }
    : {
        phase: "awake" as const,
        gesture: "none" as const,
        eyes: "open" as const,
        trigger,
      };
}
