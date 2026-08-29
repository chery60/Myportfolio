"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPetById,
  PetArtwork,
  type MovementType,
} from "@/components/pet-artwork";
import { useSelectedPet } from "@/components/use-selected-pet";

type Point = {
  x: number;
  y: number;
};

type HopState = {
  active: boolean;
  start: Point;
  end: Point;
  startedAt: number;
  duration: number;
  lift: number;
};

const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
const POINTER_OFFSET_Y = 24;
const MOVING_HOLD_MS = 280;
const WALK_MAX_SPEED = 7;
const WALK_LERP_FACTOR = 0.08;
const WALK_ARRIVAL_THRESHOLD = 20;
const HOP_ARRIVAL_THRESHOLD = 14;
const HOP_MIN_STEP = 24;
const HOP_MAX_STEP = 82;
const HOP_MIN_LIFT = 13;
const HOP_MAX_LIFT = 28;

const IDLE_HOP_STATE: HopState = {
  active: false,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  startedAt: 0,
  duration: 240,
  lift: 0,
};

function clampTarget({ x, y }: Point): Point {
  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.min(Math.max(x, 38), window.innerWidth - 38),
    y: Math.min(Math.max(y, 80), window.innerHeight - 74),
  };
}

function easeInOut(progress: number) {
  return 0.5 - Math.cos(progress * Math.PI) / 2;
}

function createHop(position: Point, target: Point, time: number): HopState {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= HOP_ARRIVAL_THRESHOLD) {
    return IDLE_HOP_STATE;
  }

  const stepDistance = Math.min(
    HOP_MAX_STEP,
    Math.max(HOP_MIN_STEP, distance * 0.42)
  );
  const ratio = stepDistance / distance;
  const end = clampTarget({
    x: position.x + dx * ratio,
    y: position.y + dy * ratio,
  });

  return {
    active: true,
    start: position,
    end,
    startedAt: time,
    duration: Math.min(320, Math.max(190, stepDistance * 3.6)),
    lift: Math.min(HOP_MAX_LIFT, Math.max(HOP_MIN_LIFT, stepDistance * 0.34)),
  };
}

export default function PetCursor() {
  const characterRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const birdImageRef = useRef<HTMLImageElement>(null);
  const birdShadowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Point>({ x: 120, y: 120 });
  const positionRef = useRef<Point>({ x: 120, y: 120 });
  const hopRef = useRef<HopState>(IDLE_HOP_STATE);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastPointerMoveRef = useRef(0);
  const facingLeftRef = useRef(false);
  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const selectedPet = useSelectedPet();
  const movementType = getPetById(selectedPet).movementType;
  const movementTypeRef = useRef<MovementType>(movementType);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const setMoving = useCallback((nextMoving: boolean) => {
    movingRef.current = nextMoving;
    setIsMoving(nextMoving);
  }, []);

  useEffect(() => {
    movementTypeRef.current = movementType;
  }, [movementType]);

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
    hopRef.current = IDLE_HOP_STATE;
    if (birdImageRef.current) {
      birdImageRef.current.style.transform = "";
    }
    if (birdShadowRef.current) {
      birdShadowRef.current.style.transform = "translateX(-50%)";
      birdShadowRef.current.style.opacity = "";
    }
  }, [selectedPet]);

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

    const setHopVisual = (lift: number, progress: number, dx: number) => {
      if (!birdImageRef.current || !birdShadowRef.current) {
        return;
      }

      const direction = dx < 0 ? -1 : 1;
      const tilt = Math.sin(progress * Math.PI) * 7 * direction;
      const shadowScale = 1 - Math.min(lift / 120, 0.22);

      birdImageRef.current.style.transform = `translateY(${-Math.round(
        lift
      )}px) rotate(${tilt.toFixed(2)}deg)`;
      birdShadowRef.current.style.transform = `translateX(-50%) scale(${shadowScale.toFixed(
        3
      )})`;
      birdShadowRef.current.style.opacity = String(1 - Math.min(lift / 90, 0.32));
    };

    const resetHopVisual = () => {
      if (birdImageRef.current) {
        birdImageRef.current.style.transform = "";
      }
      if (birdShadowRef.current) {
        birdShadowRef.current.style.transform = "translateX(-50%)";
        birdShadowRef.current.style.opacity = "";
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
      setMoving(true);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        visibleRef.current = false;
        setIsVisible(false);
        hopRef.current = IDLE_HOP_STATE;
        resetHopVisual();
        setMoving(false);
      }
    };

    const animateWalk = (
      time: number,
      frameScale: number,
      dx: number,
      dy: number,
      distance: number
    ) => {
      resetHopVisual();

      if (visibleRef.current && distance > WALK_ARRIVAL_THRESHOLD) {
        const easedFactor = 1 - Math.pow(1 - WALK_LERP_FACTOR, frameScale);
        let moveX = dx * easedFactor;
        let moveY = dy * easedFactor;
        const moveLength = Math.hypot(moveX, moveY);

        if (moveLength > WALK_MAX_SPEED * frameScale) {
          const scale = (WALK_MAX_SPEED * frameScale) / moveLength;
          moveX *= scale;
          moveY *= scale;
        }

        const nextPosition = {
          x: positionRef.current.x + moveX,
          y: positionRef.current.y + moveY,
        };

        positionRef.current = nextPosition;
        setPosition(nextPosition);
        setFacing(dx);
        setMoving(true);
        return;
      }

      const recentlyMovedPointer =
        time - lastPointerMoveRef.current < MOVING_HOLD_MS;

      if (visibleRef.current && recentlyMovedPointer) {
        setFacing(dx);
        setMoving(true);
        return;
      }

      positionRef.current = targetRef.current;
      setPosition(targetRef.current);
      setMoving(false);
    };

    const animateHop = (time: number, dx: number, dy: number, distance: number) => {
      if (!visibleRef.current) {
        hopRef.current = IDLE_HOP_STATE;
        resetHopVisual();
        setMoving(false);
        return;
      }

      if (!hopRef.current.active && distance > HOP_ARRIVAL_THRESHOLD) {
        hopRef.current = createHop(positionRef.current, targetRef.current, time);
      }

      const hop = hopRef.current;

      if (hop.active) {
        const progress = Math.min((time - hop.startedAt) / hop.duration, 1);
        const easedProgress = easeInOut(progress);
        const nextPosition = {
          x: hop.start.x + (hop.end.x - hop.start.x) * easedProgress,
          y: hop.start.y + (hop.end.y - hop.start.y) * easedProgress,
        };
        const hopDx = hop.end.x - hop.start.x;
        const lift = Math.sin(progress * Math.PI) * hop.lift;

        positionRef.current = nextPosition;
        setPosition(nextPosition);
        setFacing(hopDx || dx);
        setHopVisual(lift, progress, hopDx || dx);
        setMoving(true);

        if (progress >= 1) {
          positionRef.current = hop.end;
          setPosition(hop.end);
          hopRef.current = IDLE_HOP_STATE;
          resetHopVisual();
        }
        return;
      }

      if (distance <= HOP_ARRIVAL_THRESHOLD) {
        positionRef.current = targetRef.current;
        setPosition(targetRef.current);
      }

      resetHopVisual();
      setFacing(dx);
      setMoving(time - lastPointerMoveRef.current < MOVING_HOLD_MS);
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

      if (movementTypeRef.current === "hop") {
        animateHop(time, dx, dy, distance);
      } else {
        animateWalk(time, frameScale, dx, dy, distance);
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
    resetHopVisual();
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
      hopRef.current = IDLE_HOP_STATE;
      resetHopVisual();
      setMoving(false);
    };
  }, [isEnabled, setMoving]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={characterRef}
      aria-hidden="true"
      data-pet-cursor
      data-selected-pet={selectedPet}
      data-movement-type={movementType}
      data-walking={movementType === "walk" && isMoving}
      data-hopping={movementType === "hop" && isMoving}
      className="fixed left-0 top-0 z-20 h-[76px] w-[76px] -ml-[38px] -mt-[76px] pointer-events-none select-none transition-opacity duration-150 will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: "translate3d(120px, 120px, 0)",
      }}
    >
      <div ref={spriteRef} style={{ transform: "scaleX(1)" }}>
        <PetArtwork
          petId={selectedPet}
          moving={movementType === "walk" && isMoving}
          imageRef={birdImageRef}
          shadowRef={birdShadowRef}
        />
      </div>
    </div>
  );
}
