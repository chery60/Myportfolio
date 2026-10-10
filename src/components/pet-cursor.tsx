"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  getPetById,
  PetArtwork,
  type MovementType,
  type PetId,
} from "@/components/pet-artwork";
import {
  usePetFollowCursor,
  useSelectedPet,
} from "@/components/use-selected-pet";
import {
  PET_BUBBLE_OFFSET_BOTTOM,
  PET_PARK_OFFSET_BOTTOM,
  PET_PARK_OFFSET_RIGHT,
  usePetParked,
} from "@/components/use-pet-parked";
import {
  togglePetChat,
  usePetChatOpen,
} from "@/components/use-pet-chat";
import {
  usePetCare,
  type PetTreat,
} from "@/components/use-pet-care";
import { usePetIdle } from "@/components/use-pet-idle";
import { usePetAttention } from "@/components/use-pet-attention";
import { PetCareScene } from "@/components/pet-care-scene";
import { PetGestureFx } from "@/components/pet-gesture-fx";
import { PetLabPanel } from "@/components/pet-lab-panel";
import {
  getGestureDuration,
  getHopStyle,
  getPetAnchorsPx,
  getReactionDuration,
} from "@/components/pet-rig";
import {
  createHop,
  getHopGroundPosition,
  getHopPose,
  getHopTransforms,
  shouldHopWalk,
  type Hop,
  type HopPose,
} from "@/lib/pet/hop-walk";
import { FIRST_NAME } from "@/lib/assistant-persona";
import {
  AppleIcon,
  DropletsIcon,
  MessageCircleIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Point = {
  x: number;
  y: number;
};

/**
 * `hopping` is the short-trip gait: birds hop toward a nearby cursor and only
 * slingshot when it is far (`HOP_WALK_MAX_DISTANCE`). See `lib/pet/hop-walk`.
 */
type FlightPhase = "idle" | "aiming" | "flying" | "landing" | "hopping";

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
  hop: Hop | null;
};

type FlightParticleKind = "smoke" | "streak" | "poof" | "dust";

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
    hop: null,
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
    hop: null,
  };
}

export default function PetCursor() {
  const chatOpen = usePetChatOpen();
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
  const parkedRef = useRef(false);
  const selectedPet = useSelectedPet();
  const followCursor = usePetFollowCursor();
  const parked = usePetParked();
  const movementType = getPetById(selectedPet).movementType;
  const selectedPetRef = useRef<PetId>(selectedPet);
  const movementTypeRef = useRef<MovementType>(movementType);
  const usesDepthFlight =
    movementType === "fly" && !DEPTH_FLIGHT_EXCLUDED_PETS.has(selectedPet);
  const [isEnabled, setIsEnabled] = useState(false);
  const [careMenuOpen, setCareMenuOpen] = useState(false);
  const careEnabled = isEnabled && !followCursor && !parked && !chatOpen;
  const care = usePetCare(careEnabled, selectedPet);
  // Idle life belongs to the parked pet only — a pet chasing the cursor is
  // already expressing itself through the walk/flight machine.
  const {
    phase: idlePhase,
    gesture: idleGesture,
    eyes: idleEyes,
    trigger: triggerGesture,
  } = usePetIdle(careEnabled && !careMenuOpen && !care.reaction, selectedPet);
  // Noticing the cursor is for an awake pet that is not busy with something
  // else; a gesture or a reaction owns the body while it runs.
  const attentionRef = useRef<HTMLDivElement>(null);
  const { petted, hoverHandlers } = usePetAttention(
    careEnabled &&
      !careMenuOpen &&
      !care.reaction &&
      idlePhase !== "asleep" &&
      idleGesture === "none",
    attentionRef
  );
  const [petLabRequested, setPetLabRequested] = useState(false);
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

  // Dev-only review panel (`?petlab`). Deferred a frame like the other
  // client-only reads here, so the first render matches the server's.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const frame = window.requestAnimationFrame(() =>
      setPetLabRequested(new URLSearchParams(window.location.search).has("petlab"))
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!followCursor && !parked && !chatOpen) return;
    const frame = window.requestAnimationFrame(() => setCareMenuOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [chatOpen, followCursor, parked]);

  useEffect(() => {
    if (!careMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCareMenuOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-pet-care-ui]")) return;
      setCareMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [careMenuOpen]);

  /**
   * While the pet is speaking it parks in the bottom-right corner so the bubble
   * is a stationary click target instead of one that chases the cursor.
   *
   * This only overrides the *target*; the existing walk/fly state machine does
   * the travelling, so a walker walks over and a flyer flies over. It is kept
   * out of the main rAF effect's dependencies on purpose — re-running that
   * effect tears down the loop and snaps the pet back to its entry position.
   *
   * The park point deliberately skips `clampTarget`, whose `y` ceiling of
   * `innerHeight - 74` would leave the pet floating 50px above where the static
   * pet sits, visually detached from its own bubble.
   */
  useEffect(() => {
    parkedRef.current = parked;

    if (!parked || !followCursor || !isEnabled) {
      return;
    }

    const parkTarget = () => {
      const point = {
        x: window.innerWidth - PET_PARK_OFFSET_RIGHT,
        y: window.innerHeight - PET_PARK_OFFSET_BOTTOM,
      };
      targetRef.current = point;

      // In follow mode the pet stays hidden until the first pointer move. If
      // the greeting parks it before the visitor has moved the mouse, drop it
      // in at the park point so it is actually there to do the talking.
      if (!visibleRef.current) {
        positionRef.current = point;
        if (characterRef.current) {
          characterRef.current.style.transform = `translate3d(${Math.round(
            point.x
          )}px, ${Math.round(point.y)}px, 0)`;
        }
        visibleRef.current = true;
        setIsVisible(true);
      }
    };

    parkTarget();
    window.addEventListener("resize", parkTarget);
    return () => window.removeEventListener("resize", parkTarget);
  }, [followCursor, isEnabled, parked]);

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
    if (followCursor || !isEnabled) {
      return;
    }

    visibleRef.current = true;
    flightRef.current = createIdleFlightState();
    particlesRef.current = [];
    targetRef.current = { x: 0, y: 0 };
    positionRef.current = { x: 0, y: 0 };

    if (spriteRef.current) {
      spriteRef.current.style.transform = "scaleX(1)";
    }
    if (birdImageRef.current) {
      birdImageRef.current.style.transform = "";
      birdImageRef.current.style.filter = "";
    }
    if (birdShadowRef.current) {
      birdShadowRef.current.style.transform = "translateX(-50%)";
      birdShadowRef.current.style.opacity = "";
    }

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
      setFlightPhase("idle");
      setParticles([]);
      setMoving(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [followCursor, isEnabled, selectedPet, setMoving]);

  useEffect(() => {
    if (!isEnabled || !followCursor) {
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
        const isDust = kind === "dust";
        const size =
          kind === "streak"
            ? 18 + Math.random() * 16
            : kind === "poof"
              ? 15 + Math.random() * 18
              : isDust
                ? 5 + Math.random() * 4
                : 9 + Math.random() * 12;

        return {
          id: particleIdRef.current++,
          kind,
          // Dust is kicked up at the feet, not the body.
          x: origin.x + jitter * (isDust ? 8 : 14),
          y: origin.y + (isDust ? -2 : 18 + spread * 3),
          dx:
            kind === "streak"
              ? -direction * (36 + Math.random() * 24)
              : isDust
                ? spread * 10 - direction * 3
                : -direction * (12 + Math.random() * 24),
          dy:
            kind === "streak"
              ? spread * 2
              : isDust
                ? -3 - Math.random() * 4
                : -8 - Math.random() * 22 + Math.abs(spread) * 3,
          size,
          angle:
            kind === "streak"
              ? direction > 0
                ? -6 + spread * 5
                : 174 - spread * 5
              : Math.random() * 24 - 12,
          createdAt: time,
          duration:
            kind === "streak" ? 260 : kind === "poof" ? 520 : isDust ? 420 : 620,
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

    const setHopVisual = (pose: HopPose, height: number) => {
      if (!birdImageRef.current || !birdShadowRef.current) {
        return;
      }

      const transforms = getHopTransforms(pose, height);
      birdImageRef.current.style.transform = transforms.image;
      birdImageRef.current.style.filter = "";
      birdShadowRef.current.style.transform = transforms.shadow;
      birdShadowRef.current.style.opacity = transforms.shadowOpacity;
    };

    const beginHop = (time: number) => {
      const hop = createHop(
        positionRef.current,
        targetRef.current,
        time,
        getHopStyle(selectedPetRef.current)
      );
      setFlightState({
        ...createIdleFlightState("hopping"),
        direction: hop.direction,
        hop,
      });
      setMoving(true);
    };

    const isShortTrip = (distance: number) =>
      shouldHopWalk(distance, FLIGHT_ARRIVAL_THRESHOLD, reducedMotionRef.current);

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

      // Parked: the park effect owns the target until the pet stops speaking.
      if (parkedRef.current) {
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
        // A hop in progress finishes before the bird re-aims, exactly like a
        // flight does; the next hop then heads for the new target.
        if (flight.phase !== "flying" && flight.phase !== "hopping") {
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

        // Short trips are hopped, not flown, and need no wind-up: a bird
        // hops after a nearby target straight away.
        if (isShortTrip(distance)) {
          beginHop(time);
          return;
        }

        setAimingVisual(time, dx);
        setMoving(true);

        if (time - lastPointerMoveRef.current >= FLIGHT_IDLE_DELAY_MS) {
          beginFlight(time);
        }
        return;
      }

      if (flight.phase === "hopping" && flight.hop) {
        const hop = flight.hop;
        const progress = clamp((time - hop.startedAt) / hop.durationMs, 0, 1);
        const ground = getHopGroundPosition(hop, progress);

        positionRef.current = ground;
        setPosition(ground);
        setFacing(hop.end.x - hop.start.x);
        setHopVisual(getHopPose(progress), hop.height);
        setMoving(true);

        if (progress >= 1) {
          emitParticles("dust", hop.end, 2, hop.direction, time);
          resetFlightVisual();
          const remaining = getDistance(hop.end, targetRef.current);

          if (isShortTrip(remaining)) {
            beginHop(time);
          } else if (remaining > FLIGHT_ARRIVAL_THRESHOLD) {
            // The cursor ran off: aim and slingshot after it as before.
            setFlightState(createIdleFlightState("aiming"));
          } else {
            setFlightState(createIdleFlightState());
            setMoving(false);
          }
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
  }, [followCursor, isEnabled, setFlightState, setMoving]);

  if (!isEnabled) {
    return null;
  }

  // In follow mode the pet is never idle — the walk/flight machine owns it, so
  // the attributes are dropped entirely rather than pinned to "awake". Leaving
  // them on would keep the breathing loop running underneath the flight
  // transforms, which is exactly the motion follow mode is not supposed to have.
  const isReacting = Boolean(care.reaction);
  const idlePose = followCursor || isReacting ? undefined : idlePhase;
  const idleGestureAttr = followCursor || isReacting ? undefined : idleGesture;
  const idleEyesAttr = followCursor || isReacting ? undefined : idleEyes;
  const isAsleep = !followCursor && !isReacting && idlePhase === "asleep";
  // `parked` is true whenever the walkthrough greeting or the chat panel is
  // using this corner. Two bubbles stacked on one pet is nonsense, and the
  // sleep note is the least important of the three, so it yields.
  const showCareRequest = Boolean(care.need) && !careMenuOpen && !isAsleep;
  const showCareFeedback = Boolean(care.feedback) && !careMenuOpen;
  const showSleepNote =
    isAsleep && !parked && !chatOpen && !careMenuOpen && !care.feedback;
  const activeFlightPhase = followCursor ? flightPhase : "idle";
  const activeWalking = followCursor && movementType === "walk" && isMoving;
  const activeFlying = followCursor && movementType === "fly" && isMoving;
  // Durations are owned by pet-rig.ts and handed to CSS, so the keyframes in
  // src/styles/pet-motion/ can never disagree with the timers that end them.
  const motionStyle = {
    "--pet-reaction-ms": `${care.reaction ? getReactionDuration(selectedPet, care.reaction) : 0}ms`,
    "--pet-gesture-ms": `${getGestureDuration(selectedPet, idleGesture)}ms`,
    "--pet-pivot-x": `${getPetAnchorsPx(selectedPet).pivotXPercent.toFixed(1)}%`,
  } as CSSProperties;
  const showPetLab =
    process.env.NODE_ENV === "development" && petLabRequested && careEnabled;

  return (
    <>
      {followCursor ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
        >
          {particles.map((particle) => (
            <FlightParticleView key={particle.id} particle={particle} />
          ))}
        </div>
      ) : null}
      {showCareFeedback ? (
        <PetSpeechBubble>{care.feedback}</PetSpeechBubble>
      ) : showCareRequest ? (
        <PetSpeechBubble interactive>
          <span>
            {care.need === "food"
              ? "Tiny snack break? Pick me something good."
              : "I could use a little water."}
          </span>
          <button
            type="button"
            data-pet-care-ui
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setCareMenuOpen(true)}
          >
            {care.need === "food" ? (
              <AppleIcon className="size-3" />
            ) : (
              <DropletsIcon className="size-3" />
            )}
            {care.need === "food" ? "Choose a treat" : "Give water"}
          </button>
        </PetSpeechBubble>
      ) : showSleepNote ? (
        <PetSpeechBubble>Shh&hellip; tiny power nap.</PetSpeechBubble>
      ) : null}

      {careMenuOpen && !parked ? (
        <PetCareMenu
          need={care.need}
          busy={isReacting}
          onClose={() => setCareMenuOpen(false)}
          onFeed={(treat) => {
            care.feed(treat);
            setCareMenuOpen(false);
          }}
          onWater={() => {
            care.giveWater();
            setCareMenuOpen(false);
          }}
          onPlay={() => {
            care.play();
            setCareMenuOpen(false);
          }}
          onChat={() => {
            setCareMenuOpen(false);
            togglePetChat();
          }}
        />
      ) : null}

      {/*
        Static mode only: the parked pet doubles as the assistant's call button.

        It is a sibling that covers the sprite's exact 76px box rather than the
        sprite itself, so the sprite keeps `aria-hidden` and `pointer-events-none`
        and the follow-cursor rAF loop is untouched. In follow mode this is not
        rendered at all — a pet that tracks the cursor would swallow clicks on
        every link underneath it — and `PetChatLauncher` puts a corner button up
        instead. Rendered before the sprite so `peer-*` can drive the hover lift.
      */}
      {!followCursor ? (
        <button
          type="button"
          data-pet-care-ui
          // Follows the pet on its wander so the click target never strands.
          data-pet-wander={idleGestureAttr === "wander" || undefined}
          style={motionStyle}
          onClick={() => setCareMenuOpen((open) => !open)}
          onPointerEnter={hoverHandlers.onPointerEnter}
          onPointerLeave={hoverHandlers.onPointerLeave}
          aria-haspopup="menu"
          aria-expanded={careMenuOpen}
          aria-label={`Care for ${getPetById(selectedPet).name}`}
          className={cn(
            "peer fixed bottom-6 right-6 z-30 size-[76px] cursor-pointer rounded-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-0 top-1 grid size-5 place-items-center rounded-full border bg-card shadow-sm transition-colors",
              care.need
                ? "border-amber-400/70 text-amber-600 dark:text-amber-300"
                : "border-border text-muted-foreground"
            )}
          >
            <SparklesIcon className="size-3" />
          </span>
        </button>
      ) : null}
      <div
        ref={characterRef}
        aria-hidden="true"
        data-pet-cursor
        data-follow-cursor={followCursor}
        data-static-pet={!followCursor}
        data-selected-pet={selectedPet}
        data-movement-type={movementType}
        data-flight-phase={activeFlightPhase}
        data-walking={activeWalking}
        data-flying={activeFlying}
        data-depth-flight={followCursor && usesDepthFlight}
        className={cn(
          "fixed z-20 h-[76px] w-[76px] pointer-events-none select-none transition-opacity duration-150",
          followCursor
            ? "left-0 top-0 -ml-[38px] -mt-[76px] will-change-transform"
            : "bottom-6 right-6 motion-safe:transition-transform motion-safe:peer-hover:-translate-y-1 motion-safe:peer-focus-visible:-translate-y-1"
        )}
        style={
          followCursor
            ? {
                opacity: isVisible ? 1 : 0,
                transform: "translate3d(120px, 120px, 0)",
              }
            : { opacity: 1, ...motionStyle }
        }
      >
        <div ref={spriteRef} style={{ transform: "scaleX(1)" }}>
          {/*
            Three wrappers, not one. The sprite div above owns an inline
            `scaleX` for facing, so an animation there would be overridden;
            the cursor lean is a *transition* on the individual rotate and
            translate properties; and the sleep tilt has to be a *transition*
            while the breathing is an *animation*, which the same property on
            one element cannot be. So: lean outermost, then pose (tilt), then
            breath, gestures and care reactions inside.
          */}
          <div
            ref={attentionRef}
            data-pet-attention={!followCursor || undefined}
            data-pet-petted={petted || undefined}
          >
            <div data-pet-pose={idlePose} data-pet-eyes={idleEyesAttr}>
              <div
                data-pet-idle={idlePose}
                data-pet-gesture={idleGestureAttr}
                data-pet-reaction={care.reaction ?? undefined}
              >
                <PetArtwork
                  petId={selectedPet}
                  moving={activeWalking}
                  imageRef={birdImageRef}
                  shadowRef={birdShadowRef}
                />
              </div>
            </div>
          </div>

          {care.reaction ? (
            <PetCareScene
              petId={selectedPet}
              reaction={care.reaction}
              treat={care.treat}
            />
          ) : null}

          {!followCursor ? (
            <PetGestureFx
              petId={selectedPet}
              gesture={idleGestureAttr}
              petted={petted}
            />
          ) : null}

          {/* Two drifting Z's, offset so they never travel as a pair. */}
          {isAsleep ? (
            <span
              aria-hidden="true"
              // Anchored above the pet's head rather than its right edge: the
              // pet parks 24px from the viewport edge, so Z's drifting up and
              // to the right from there would be clipped off-screen.
              className="pointer-events-none absolute left-1/2 top-0 select-none text-xs font-semibold text-muted-foreground"
            >
              <span data-pet-zzz className="absolute">
                z
              </span>
              <span
                data-pet-zzz
                className="absolute text-[15px]"
                style={{ animationDelay: "1.1s" }}
              >
                Z
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {showPetLab ? (
        <PetLabPanel
          petId={selectedPet}
          busy={isReacting}
          onGesture={triggerGesture}
          onFeed={care.feed}
          onWater={care.giveWater}
          onPlay={care.play}
        />
      ) : null}
    </>
  );
}

function PetSpeechBubble({
  children,
  interactive = false,
}: {
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      role={interactive ? "group" : "status"}
      aria-label={interactive ? "Pet request" : undefined}
      data-pet-care-ui={interactive || undefined}
      className={cn(
        "not-prose fixed right-4 z-30 max-w-[min(15rem,calc(100vw-2rem))] sm:right-6",
        interactive ? "pointer-events-auto" : "pointer-events-none",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-500"
      )}
      style={{ bottom: PET_BUBBLE_OFFSET_BOTTOM }}
    >
      <div className="relative rounded-2xl border border-border/70 bg-card/95 px-3 py-2.5 text-card-foreground shadow-[0_18px_50px_-28px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="text-xs leading-snug">{children}</div>
        <span
          aria-hidden="true"
          className="absolute -bottom-[6px] right-7 size-2.5 rotate-45 border-b border-r border-border/70 bg-card"
        />
      </div>
    </div>
  );
}

function PetCareMenu({
  need,
  busy,
  onClose,
  onFeed,
  onWater,
  onPlay,
  onChat,
}: {
  need: "food" | "water" | null;
  busy: boolean;
  onClose: () => void;
  onFeed: (treat: PetTreat) => void;
  onWater: () => void;
  onPlay: () => void;
  onChat: () => void;
}) {
  const treats: Array<{ id: PetTreat; emoji: string; label: string }> = [
    { id: "apple", emoji: "🍎", label: "Apple" },
    { id: "berries", emoji: "🫐", label: "Berries" },
    { id: "cookie", emoji: "🍪", label: "Cookie" },
  ];

  return (
    <div
      data-pet-care-ui
      role="dialog"
      aria-label="Pet care"
      className="not-prose fixed bottom-[108px] right-4 z-40 w-[min(284px,calc(100vw-2rem))] origin-bottom-right rounded-[22px] border border-border/75 bg-card/95 p-3 text-card-foreground shadow-[0_24px_70px_-28px_rgba(0,0,0,0.58)] backdrop-blur-xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200 sm:right-6"
    >
      <div className="mb-2.5 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold tracking-tight">A little care break</p>
          <p className="text-[11px] leading-4 text-muted-foreground">
            Pick something for your tiny companion.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pet care"
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-2 transition-colors",
          need === "food"
            ? "border-amber-400/55 bg-amber-50/65 dark:bg-amber-950/20"
            : "border-border/70 bg-muted/35"
        )}
      >
        <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
          <AppleIcon className="size-3" />
          Choose a treat
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {treats.map((treat) => (
            <button
              key={treat.id}
              type="button"
              disabled={busy}
              onClick={() => onFeed(treat.id)}
              className="group flex min-h-14 flex-col items-center justify-center rounded-xl border border-border/70 bg-background/80 text-[10px] font-medium transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <span
                aria-hidden="true"
                className="text-xl leading-none transition-transform group-hover:scale-110"
              >
                {treat.emoji}
              </span>
              <span className="mt-1">{treat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onWater}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            need === "water"
              ? "border-sky-400/60 bg-sky-50 text-sky-800 dark:bg-sky-950/25 dark:text-sky-200"
              : "border-border/70 bg-background/80"
          )}
        >
          <DropletsIcon className="size-3.5 text-sky-500" />
          Water
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onPlay}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <SparklesIcon className="size-3.5 text-amber-500" />
          Play
        </button>
      </div>

      <button
        type="button"
        onClick={onChat}
        className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageCircleIcon className="size-3.5" />
        Ask {FIRST_NAME}&rsquo;s assistant
      </button>
    </div>
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
