"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PetArtwork,
} from "@/components/pet-artwork";
import { useSelectedPet } from "@/components/use-selected-pet";

type Point = {
  x: number;
  y: number;
};

const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
const POINTER_OFFSET_Y = 24;
const WALKING_HOLD_MS = 280;
const MAX_SPEED = 7;
const LERP_FACTOR = 0.08;
const ARRIVAL_THRESHOLD = 20;

function clampTarget({ x, y }: Point): Point {
  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.min(Math.max(x, 30), window.innerWidth - 30),
    y: Math.min(Math.max(y, 58), window.innerHeight - 74),
  };
}

export default function PetCursor() {
  const characterRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Point>({ x: 120, y: 120 });
  const positionRef = useRef<Point>({ x: 120, y: 120 });
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastPointerMoveRef = useRef(0);
  const facingLeftRef = useRef(false);
  const walkingRef = useRef(false);
  const visibleRef = useRef(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const selectedPet = useSelectedPet();

  const setWalking = useCallback((nextWalking: boolean) => {
    if (walkingRef.current === nextWalking) {
      return;
    }

    walkingRef.current = nextWalking;
    setIsWalking(nextWalking);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);

    const updateEnabled = () => {
      setIsEnabled(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsVisible(false);
        visibleRef.current = false;
      }
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const setPosition = ({ x, y }: Point) => {
      if (characterRef.current) {
        characterRef.current.style.transform = `translate3d(${Math.round(
          x
        )}px, ${Math.round(y)}px, 0)`;
      }
    };

    const setFacing = (dx: number) => {
      if (dx < -0.5) {
        facingLeftRef.current = true;
      } else if (dx > 0.5) {
        facingLeftRef.current = false;
      }

      if (spriteRef.current) {
        spriteRef.current.style.transform = `scaleX(${
          facingLeftRef.current ? -1 : 1
        })`;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      const nextTarget = clampTarget({
        x: event.clientX,
        y: event.clientY + POINTER_OFFSET_Y,
      });

      if (!visibleRef.current) {
        const entrancePosition = clampTarget({
          x: nextTarget.x - 128,
          y: nextTarget.y + 38,
        });

        positionRef.current = entrancePosition;
        setPosition(entrancePosition);
        visibleRef.current = true;
        setIsVisible(true);
      }

      targetRef.current = nextTarget;
      lastPointerMoveRef.current = performance.now();
      setWalking(true);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        visibleRef.current = false;
        setIsVisible(false);
        setWalking(false);
      }
    };

    const animate = (time: number) => {
      const lastTime = lastTimeRef.current || time;
      const delta = Math.min(time - lastTime, 80);
      const frameScale = delta / (1000 / 60);
      lastTimeRef.current = time;

      const position = positionRef.current;
      const target = targetRef.current;
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const distance = Math.hypot(dx, dy);

      if (visibleRef.current && distance > ARRIVAL_THRESHOLD) {
        const easedFactor = 1 - Math.pow(1 - LERP_FACTOR, frameScale);
        let moveX = dx * easedFactor;
        let moveY = dy * easedFactor;
        const moveLength = Math.hypot(moveX, moveY);

        if (moveLength > MAX_SPEED * frameScale) {
          const scale = (MAX_SPEED * frameScale) / moveLength;
          moveX *= scale;
          moveY *= scale;
        }

        const nextPosition = {
          x: position.x + moveX,
          y: position.y + moveY,
        };

        positionRef.current = nextPosition;
        setPosition(nextPosition);
        setFacing(dx);
        setWalking(true);
      } else {
        const recentlyMovedPointer =
          time - lastPointerMoveRef.current < WALKING_HOLD_MS;

        if (visibleRef.current && recentlyMovedPointer) {
          setFacing(dx);
          setWalking(true);
        } else {
          positionRef.current = target;
          setPosition(target);
          setWalking(false);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    const start = clampTarget({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    targetRef.current = start;
    positionRef.current = start;
    setPosition(start);
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      setWalking(false);
    };
  }, [isEnabled, setWalking]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={characterRef}
      aria-hidden="true"
      data-pet-cursor
      data-selected-pet={selectedPet}
      data-walking={isWalking}
      className="fixed left-0 top-0 z-20 h-[58px] w-[58px] -ml-[29px] -mt-[58px] pointer-events-none select-none transition-opacity duration-150 will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: "translate3d(120px, 120px, 0)",
      }}
    >
      <div ref={spriteRef} style={{ transform: "scaleX(1)" }}>
        <PetArtwork petId={selectedPet} walking={isWalking} />
      </div>
    </div>
  );
}
