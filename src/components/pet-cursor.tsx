"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  getPetById,
  PetArtwork,
  type MovementType,
  type PetId,
} from "@/components/pet-artwork";
import { useSelectedPet } from "@/components/use-selected-pet";

type Point = {
  x: number;
  y: number;
};

type FlightPhase = "idle" | "aiming" | "flying" | "landing";

type FlightState = {
  phase: FlightPhase;
  start: Point;
  end: Point;
  control: Point;
  startedAt: number;
  duration: number;
  arcHeight: number;
  direction: number;
  lastParticleAt: number;
  landingStartedAt: number;
};

type FlightParticleKind = "smoke" | "streak" | "poof";

type FlightParticle = {
  id: number;
  kind: FlightParticleKind;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  angle: number;
  createdAt: number;
  duration: number;
};

const DESKTOP_POINTER_QUERY =
  "(min-width: 640px) and (any-hover: hover) and (any-pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_OFFSET_Y = 24;
const MOVING_HOLD_MS = 280;
const WALK_MAX_SPEED = 7;
const WALK_LERP_FACTOR = 0.08;
const WALK_ARRIVAL_THRESHOLD = 20;
const FLIGHT_ARRIVAL_THRESHOLD = 14;
const FLIGHT_IDLE_DELAY_MS = 110;
const LANDING_DURATION_MS = 190;
const MAX_PARTICLES = 28;
const DEPTH_FLIGHT_EXCLUDED_PETS = new Set<PetId>([
  "among-us",
  "blues",
  "melody",
  "willow",
  "hatchlings",
]);

function createIdleFlightState(phase: FlightPhase = "idle"): FlightState {
  return {
    phase,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    control: { x: 0, y: 0 },
    startedAt: 0,
    duration: 260,
    arcHeight: 0,
    direction: 1,
    lastParticleAt: 0,
    landingStartedAt: 0,
  };
}

function clampTarget({ x, y }: Point): Point {
  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.min(Math.max(x, 38), window.innerWidth - 38),
    y: Math.min(Math.max(y, 80), window.innerHeight - 74),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeInOut(progress: number) {
  return 0.5 - Math.cos(progress * Math.PI) / 2;
}

function getDistance(from: Point, to: Point) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function getQuadraticPoint(
  start: Point,
  control: Point,
  end: Point,
  progress: number
) {
  const inverse = 1 - progress;

  return {
    x:
      inverse * inverse * start.x +
      2 * inverse * progress * control.x +
      progress * progress * end.x,
    y:
      inverse * inverse * start.y +
      2 * inverse * progress * control.y +
      progress * progress * end.y,
  };
}

function getQuadraticTangent(
  start: Point,
  control: Point,
  end: Point,
  progress: number
) {
  return {
    x:
      2 * (1 - progress) * (control.x - start.x) +
      2 * progress * (end.x - control.x),
    y:
      2 * (1 - progress) * (control.y - start.y) +
      2 * progress * (end.y - control.y),
  };
}

function createFlight(
  position: Point,
  target: Point,
  time: number,
  reducedMotion: boolean
): FlightState {
  const end = clampTarget(target);
  const dx = end.x - position.x;
  const dy = end.y - position.y;
  const distance = Math.hypot(dx, dy);
  const direction = dx < 0 ? -1 : 1;
  const arcHeight = reducedMotion
    ? 0
    : clamp(distance * 0.22 + Math.abs(dy) * 0.14, 28, 190);

  return {
    phase: "flying",
    start: position,
    end,
    control: {
      x: position.x + dx * 0.52,
      y: Math.min(position.y, end.y) - arcHeight,
    },
    startedAt: time,
    duration: reducedMotion
      ? clamp(distance * 0.28 + 140, 180, 360)
      : clamp(distance * 0.62 + 240, 340, 920),
    arcHeight,
    direction,
    lastParticleAt: 0,
    landingStartedAt: 0,
  };
}

export default function PetCursor() {
  const characterRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const birdImageRef = useRef<HTMLImageElement>(null);
  const birdShadowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Point>({ x: 120, y: 120 });
  const positionRef = useRef<Point>({ x: 120, y: 120 });
  const flightRef = useRef<FlightState>(createIdleFlightState());
  const particlesRef = useRef<FlightParticle[]>([]);
  const particleIdRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastPointerMoveRef = useRef(0);
  const facingLeftRef = useRef(false);
  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const selectedPet = useSelectedPet();
  const movementType = getPetById(selectedPet).movementType;
  const selectedPetRef = useRef<PetId>(selectedPet);
  const movementTypeRef = useRef<MovementType>(movementType);
  const usesDepthFlight =
    movementType === "fly" && !DEPTH_FLIGHT_EXCLUDED_PETS.has(selectedPet);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [flightPhase, setFlightPhase] = useState<FlightPhase>("idle");
  const [particles, setParticles] = useState<FlightParticle[]>([]);

  const setMoving = useCallback((nextMoving: boolean) => {
    movingRef.current = nextMoving;
    setIsMoving(nextMoving);
  }, []);

  const setFlightState = useCallback((nextFlight: FlightState) => {
    const previousPhase = flightRef.current.phase;
    flightRef.current = nextFlight;
    if (previousPhase !== nextFlight.phase) {
      setFlightPhase(nextFlight.phase);
    }
  }, []);

  useEffect(() => {
    selectedPetRef.current = selectedPet;
    movementTypeRef.current = movementType;
  }, [movementType, selectedPet]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const updateEnabled = () => {
      setIsEnabled(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsVisible(false);
        visibleRef.current = false;
      }
    };

    const updateReducedMotion = () => {
      reducedMotionRef.current = reducedMotionQuery.matches;
    };

    updateEnabled();
    updateReducedMotion();
    mediaQuery.addEventListener("change", updateEnabled);
    reducedMotionQuery.addEventListener("change", updateReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      reducedMotionQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  useEffect(() => {
    flightRef.current = createIdleFlightState();
    particlesRef.current = [];
    if (birdImageRef.current) {
      birdImageRef.current.style.transform = "";
    }
    if (birdShadowRef.current) {
      birdShadowRef.current.style.transform = "translateX(-50%)";
      birdShadowRef.current.style.opacity = "";
    }

    const frame = window.requestAnimationFrame(() => {
      setFlightPhase("idle");
      setParticles([]);
      setMoving(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedPet, setMoving]);

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

    const isDepthFlightEnabled = () =>
      movementTypeRef.current === "fly" &&
      !DEPTH_FLIGHT_EXCLUDED_PETS.has(selectedPetRef.current);

    const publishParticles = (nextParticles: FlightParticle[]) => {
      const cappedParticles = nextParticles.slice(-MAX_PARTICLES);
      particlesRef.current = cappedParticles;
      setParticles(cappedParticles);
    };

    const pruneParticles = (time: number) => {
      if (particlesRef.current.length === 0) {
        return;
      }

      const liveParticles = particlesRef.current.filter(
        (particle) => time - particle.createdAt < particle.duration
      );

      if (liveParticles.length !== particlesRef.current.length) {
        publishParticles(liveParticles);
      }
    };

    const emitParticles = (
      kind: FlightParticleKind,
      origin: Point,
      count: number,
      direction: number,
      time: number
    ) => {
      if (reducedMotionRef.current) {
        return;
      }

      const newParticles = Array.from({ length: count }, (_, index) => {
        const spread = index - (count - 1) / 2;
        const jitter = Math.random() - 0.5;
        const size =
          kind === "streak"
            ? 18 + Math.random() * 16
            : kind === "poof"
              ? 15 + Math.random() * 18
              : 9 + Math.random() * 12;

        return {
          id: particleIdRef.current++,
          kind,
          x: origin.x + jitter * 14,
          y: origin.y + 18 + spread * 3,
          dx:
            kind === "streak"
              ? -direction * (36 + Math.random() * 24)
              : -direction * (12 + Math.random() * 24),
          dy:
            kind === "streak"
              ? spread * 2
              : -8 - Math.random() * 22 + Math.abs(spread) * 3,
          size,
          angle:
            kind === "streak"
              ? direction > 0
                ? -6 + spread * 5
                : 174 - spread * 5
              : Math.random() * 24 - 12,
          createdAt: time,
          duration: kind === "streak" ? 260 : kind === "poof" ? 520 : 620,
        };
      });

      publishParticles([...particlesRef.current, ...newParticles]);
    };

    const setAimingVisual = (time: number, dx: number) => {
      if (!birdImageRef.current || !birdShadowRef.current) {
        return;
      }

      const direction = dx < 0 ? -1 : 1;
      const pulse = Math.max(Math.sin(time / 76), 0);
      const wobble = Math.sin(time / 110) * 2.4 * direction;
      const depthEnabled = isDepthFlightEnabled();

      birdImageRef.current.style.transform = depthEnabled
        ? `perspective(320px) translate3d(0, ${(
            -2 -
            pulse * 2
          ).toFixed(2)}px, ${(7 + pulse * 8).toFixed(2)}px) rotateX(${(
            -3 -
            pulse * 2
          ).toFixed(2)}deg) rotateY(${(direction * (5 + pulse * 4)).toFixed(
            2
          )}deg) rotateZ(${wobble.toFixed(2)}deg) scale3d(${(
            1 +
            pulse * 0.028
          ).toFixed(3)}, ${(1 - pulse * 0.038).toFixed(3)}, 1)`
        : `translateY(${(-2 - pulse * 2).toFixed(2)}px) rotate(${wobble.toFixed(
            2
          )}deg) scale(${(1 + pulse * 0.025).toFixed(3)}, ${(
            1 -
            pulse * 0.035
          ).toFixed(3)})`;
      birdImageRef.current.style.filter = depthEnabled
        ? "drop-shadow(0 12px 12px rgba(15,23,42,0.18)) saturate(1.06) contrast(1.03)"
        : "";
      birdShadowRef.current.style.transform = `translateX(-50%) scale(${(
        (depthEnabled ? 1.06 : 1) +
        pulse * (depthEnabled ? 0.07 : 0.045)
      ).toFixed(3)}, ${(1 - pulse * (depthEnabled ? 0.08 : 0.06)).toFixed(
        3
      )})`;
      birdShadowRef.current.style.opacity = "0.9";
    };

    const setFlightVisual = (
      progress: number,
      tangent: Point,
      flight: FlightState
    ) => {
      if (!birdImageRef.current || !birdShadowRef.current) {
        return;
      }

      if (reducedMotionRef.current) {
        birdImageRef.current.style.transform = "";
        birdShadowRef.current.style.transform = "translateX(-50%)";
        birdShadowRef.current.style.opacity = "";
        return;
      }

      const travelAngle =
        Math.atan2(tangent.y, Math.abs(tangent.x)) * (180 / Math.PI);
      const mirroredAngle = flight.direction < 0 ? -travelAngle : travelAngle;
      const launchSquash = Math.max(0, 1 - progress / 0.18);
      const settleStretch = Math.max(0, (progress - 0.86) / 0.14);
      const spin = Math.sin(progress * Math.PI * 2.2) * 5 * flight.direction;
      const tilt = clamp(mirroredAngle * 0.55 + spin, -28, 28);
      const liftAmount =
        Math.sin(progress * Math.PI) * Math.min(flight.arcHeight * 0.1, 16);
      const scaleX = 1 + launchSquash * 0.12 - settleStretch * 0.04;
      const scaleY = 1 - launchSquash * 0.09 + settleStretch * 0.03;
      const flightLift = Math.sin(progress * Math.PI);
      const shadowScale = 1 - flightLift * 0.3;
      const depthEnabled = isDepthFlightEnabled();

      birdImageRef.current.style.transform = depthEnabled
        ? `perspective(340px) translate3d(0, ${-liftAmount.toFixed(
            2
          )}px, ${(8 + flightLift * 24).toFixed(2)}px) rotateX(${clamp(
            -flightLift * 13 - mirroredAngle * 0.12,
            -18,
            10
          ).toFixed(2)}deg) rotateY(${(
            flight.direction *
            (9 + flightLift * 13)
          ).toFixed(2)}deg) rotateZ(${tilt.toFixed(
            2
          )}deg) scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`
        : `translateY(${-liftAmount.toFixed(2)}px) rotate(${tilt.toFixed(
            2
          )}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      birdImageRef.current.style.filter = depthEnabled
        ? `drop-shadow(0 ${(13 + flightLift * 10).toFixed(
            1
          )}px ${(12 + flightLift * 14).toFixed(
            1
          )}px rgba(15,23,42,${(0.2 - flightLift * 0.06).toFixed(
            2
          )})) saturate(1.08) contrast(1.04)`
        : "";
      birdShadowRef.current.style.transform = `translateX(-50%) scale(${shadowScale.toFixed(
        3
      )})`;
      birdShadowRef.current.style.opacity = String(
        0.75 - Math.sin(progress * Math.PI) * 0.28
      );
    };

    const setLandingVisual = (progress: number) => {
      if (!birdImageRef.current || !birdShadowRef.current) {
        return;
      }

      const bounce = Math.sin(progress * Math.PI) * 5;
      const squash = Math.sin(progress * Math.PI) * 0.08;
      const depthEnabled = isDepthFlightEnabled();

      birdImageRef.current.style.transform = depthEnabled
        ? `perspective(320px) translate3d(0, ${-bounce.toFixed(
            2
          )}px, ${(4 + squash * 55).toFixed(2)}px) rotateX(${(
            -squash * 42
          ).toFixed(2)}deg) scale3d(${(1 + squash).toFixed(3)}, ${(
            1 -
            squash * 0.75
          ).toFixed(3)}, 1)`
        : `translateY(${-bounce.toFixed(2)}px) scale(${(1 + squash).toFixed(
            3
          )}, ${(1 - squash * 0.75).toFixed(3)})`;
      birdImageRef.current.style.filter = depthEnabled
        ? "drop-shadow(0 12px 12px rgba(15,23,42,0.18)) saturate(1.06) contrast(1.03)"
        : "";
      birdShadowRef.current.style.transform = `translateX(-50%) scale(${(
        1 +
        squash * 0.75
      ).toFixed(3)})`;
      birdShadowRef.current.style.opacity = "0.9";
    };

    const resetFlightVisual = () => {
      if (birdImageRef.current) {
        birdImageRef.current.style.transform = "";
        birdImageRef.current.style.filter = "";
      }
      if (birdShadowRef.current) {
        birdShadowRef.current.style.transform = "translateX(-50%)";
        birdShadowRef.current.style.opacity = "";
      }
    };

    const beginFlight = (time: number) => {
      const position = positionRef.current;
      const target = targetRef.current;

      if (getDistance(position, target) <= FLIGHT_ARRIVAL_THRESHOLD) {
        positionRef.current = target;
        setPosition(target);
        setFlightState(createIdleFlightState());
        resetFlightVisual();
        setMoving(false);
        return;
      }

      const flight = createFlight(
        position,
        target,
        time,
        reducedMotionRef.current
      );
      emitParticles("poof", position, 5, flight.direction, time);
      emitParticles("streak", position, 3, flight.direction, time);
      setFlightState(flight);
      setMoving(true);
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

      if (movementTypeRef.current === "fly") {
        const flight = flightRef.current;
        if (flight.phase !== "flying") {
          setFlightState(createIdleFlightState("aiming"));
        }
        setFacing(nextTarget.x - positionRef.current.x);
        setMoving(true);
        return;
      }

      setMoving(true);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        visibleRef.current = false;
        setIsVisible(false);
        setFlightState(createIdleFlightState());
        publishParticles([]);
        resetFlightVisual();
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
      resetFlightVisual();

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

    const animateFlight = (time: number, dx: number, distance: number) => {
      if (!visibleRef.current) {
        setFlightState(createIdleFlightState());
        resetFlightVisual();
        setMoving(false);
        return;
      }

      const flight = flightRef.current;

      if (flight.phase === "aiming") {
        setFacing(dx);
        setAimingVisual(time, dx);
        setMoving(true);

        if (time - lastPointerMoveRef.current >= FLIGHT_IDLE_DELAY_MS) {
          beginFlight(time);
        }
        return;
      }

      if (flight.phase === "flying") {
        const rawProgress = clamp(
          (time - flight.startedAt) / flight.duration,
          0,
          1
        );
        const progress = reducedMotionRef.current
          ? easeInOut(rawProgress)
          : rawProgress;
        const nextPosition = getQuadraticPoint(
          flight.start,
          flight.control,
          flight.end,
          progress
        );
        const tangent = getQuadraticTangent(
          flight.start,
          flight.control,
          flight.end,
          progress
        );

        positionRef.current = nextPosition;
        setPosition(nextPosition);
        setFacing(tangent.x || flight.direction);
        setFlightVisual(progress, tangent, flight);
        setMoving(true);

        if (
          !reducedMotionRef.current &&
          time - flight.lastParticleAt > 58 &&
          rawProgress > 0.08 &&
          rawProgress < 0.92
        ) {
          emitParticles("smoke", nextPosition, 1, flight.direction, time);
          flightRef.current = {
            ...flightRef.current,
            lastParticleAt: time,
          };
        }

        if (rawProgress >= 1) {
          positionRef.current = flight.end;
          setPosition(flight.end);
          emitParticles("poof", flight.end, 6, flight.direction, time);
          setFlightState({
            ...flight,
            phase: "landing",
            landingStartedAt: time,
          });
        }
        return;
      }

      if (flight.phase === "landing") {
        const progress = clamp(
          (time - flight.landingStartedAt) / LANDING_DURATION_MS,
          0,
          1
        );

        setLandingVisual(progress);
        setMoving(true);

        if (progress >= 1) {
          resetFlightVisual();
          if (distance > FLIGHT_ARRIVAL_THRESHOLD) {
            setFlightState(createIdleFlightState("aiming"));
            setMoving(true);
          } else {
            setFlightState(createIdleFlightState());
            setMoving(false);
          }
        }
        return;
      }

      resetFlightVisual();
      setFacing(dx);
      setMoving(time - lastPointerMoveRef.current < MOVING_HOLD_MS);
    };

    const animate = (time: number) => {
      const lastTime = lastTimeRef.current || time;
      const delta = Math.min(time - lastTime, 80);
      const frameScale = delta / (1000 / 60);
      lastTimeRef.current = time;

      pruneParticles(time);

      const position = positionRef.current;
      const target = targetRef.current;
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const distance = Math.hypot(dx, dy);

      if (movementTypeRef.current === "fly") {
        animateFlight(time, dx, distance);
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
    resetFlightVisual();
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
      setFlightState(createIdleFlightState());
      publishParticles([]);
      resetFlightVisual();
      setMoving(false);
    };
  }, [isEnabled, setFlightState, setMoving]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
      >
        {particles.map((particle) => (
          <FlightParticleView key={particle.id} particle={particle} />
        ))}
      </div>
      <div
        ref={characterRef}
        aria-hidden="true"
        data-pet-cursor
        data-selected-pet={selectedPet}
        data-movement-type={movementType}
        data-flight-phase={flightPhase}
        data-walking={movementType === "walk" && isMoving}
        data-flying={movementType === "fly" && isMoving}
        data-depth-flight={usesDepthFlight}
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
    </>
  );
}

function FlightParticleView({ particle }: { particle: FlightParticle }) {
  const isStreak = particle.kind === "streak";
  const isPoof = particle.kind === "poof";
  const particleStyle = {
    left: particle.x,
    top: particle.y,
    width: isStreak ? particle.size * 1.9 : particle.size,
    height: isStreak ? 3 : particle.size,
    background: isStreak
      ? "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(251,191,36,0.78), rgba(249,115,22,0.28))"
      : isPoof
        ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(203,213,225,0.64) 42%, rgba(100,116,139,0.18) 74%, rgba(100,116,139,0))"
        : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.82), rgba(148,163,184,0.5) 48%, rgba(71,85,105,0.14) 76%, rgba(71,85,105,0))",
    border: isPoof ? "1px solid rgba(255,255,255,0.68)" : undefined,
    filter: isStreak ? "blur(0.15px)" : "blur(0.25px)",
    boxShadow: isStreak
      ? "0 0 10px rgba(251,191,36,0.34), 0 1px 4px rgba(120,53,15,0.18)"
      : "inset -4px -5px 8px rgba(71,85,105,0.12), inset 3px 3px 7px rgba(255,255,255,0.68), 0 9px 18px rgba(15,23,42,0.08)",
    transform: `translate3d(-50%, -50%, 0) rotate(${particle.angle}deg)`,
    transformStyle: "preserve-3d",
    animation: `${
      isStreak ? "petFlightStreak" : "petFlightSmoke"
    } ${particle.duration}ms ease-out forwards`,
    "--pet-dx": `${particle.dx}px`,
    "--pet-dy": `${particle.dy}px`,
    "--pet-angle": `${particle.angle}deg`,
    "--pet-scale": isPoof ? 2.45 : 1.9,
  } as CSSProperties;

  return (
    <span
      data-flight-particle={particle.kind}
      className={
        isStreak
          ? "absolute block rounded-full"
          : "absolute block rounded-full shadow-sm"
      }
      style={particleStyle}
    />
  );
}
