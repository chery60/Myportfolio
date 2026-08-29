"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

const DESKTOP_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)";
const CHARACTER_COLOR = "#7170ff";
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
    x: Math.min(Math.max(x, 24), window.innerWidth - 24),
    y: Math.min(Math.max(y, 54), window.innerHeight - 68),
  };
}

export default function AmongUsCursor() {
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
      data-among-us-cursor
      data-walking={isWalking}
      className="fixed left-0 top-0 z-20 h-[44px] w-[36px] -ml-[18px] -mt-[44px] pointer-events-none select-none transition-opacity duration-150 will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: "translate3d(120px, 120px, 0)",
      }}
    >
      <div ref={spriteRef} style={{ transform: "scaleX(1)" }}>
        <div
          className={isWalking ? "animate-amongus-bob" : undefined}
          style={{ position: "relative", width: "36px", height: "44px" }}
        >
          <div
            className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: "32px",
              height: "8px",
              background: "rgba(0,0,0,0.15)",
            }}
          />

          <div
            className="absolute"
            style={{
              top: "10px",
              left: "-6px",
              width: "14px",
              height: "22px",
              borderRadius: "6px",
              background: CHARACTER_COLOR,
              filter:
                "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)",
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "11px",
                borderRadius: "0 0 6px 6px",
                background: "rgba(0,0,0,0.20)",
              }}
            />
          </div>

          <div
            data-among-us-leg="front"
            className={`absolute ${isWalking ? "animate-amongus-leg-1" : ""}`}
            style={{
              bottom: "2px",
              left: "6px",
              width: "12px",
              height: "14px",
              borderRadius: "2px 2px 6px 6px",
              background: CHARACTER_COLOR,
              filter:
                "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)",
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "8px",
                borderRadius: "0 0 6px 6px",
                background: "rgba(0,0,0,0.20)",
              }}
            />
          </div>

          <div
            data-among-us-leg="back"
            className={`absolute ${isWalking ? "animate-amongus-leg-2" : ""}`}
            style={{
              bottom: "2px",
              right: "4px",
              width: "12px",
              height: "14px",
              borderRadius: "2px 2px 6px 6px",
              background: CHARACTER_COLOR,
              filter:
                "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)",
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "8px",
                borderRadius: "0 0 6px 6px",
                background: "rgba(0,0,0,0.20)",
              }}
            />
          </div>

          <div
            className="absolute"
            style={{
              top: 0,
              right: 0,
              width: "28px",
              height: "32px",
              borderRadius: "14px 14px 6px 6px",
              background: CHARACTER_COLOR,
              filter:
                "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.20)",
                borderRadius: "14px 14px 6px 6px",
                transform: "translateY(3px) translateX(3px)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "8px",
                left: "8px",
                width: "16px",
                height: "12px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                filter: "blur(4px)",
                transform: "translateY(-4px) translateX(2px)",
              }}
            />
          </div>

          <div
            className="absolute"
            style={{
              top: "6px",
              right: "-4px",
              width: "20px",
              height: "12px",
              borderRadius: "9999px",
              background: "#92D1DF",
              filter:
                "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute"
              style={{
                top: "4px",
                left: "1px",
                right: "1px",
                height: "10px",
                borderRadius: "9999px",
                background: "#527F8B",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "2px",
                right: "4px",
                width: "10px",
                height: "3px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.85)",
                transform: "rotate(-8deg)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
