import { animate, type MotionValue } from "motion/react";

export interface SpringConfig {
  readonly type: "spring";
  readonly stiffness: number;
  readonly damping: number;
  readonly mass: number;
  readonly restDelta: number;
}

export interface SpringHandle {
  stop: () => void;
  finished: Promise<void>;
}

/**
 * Springs a MotionValue to `to`, starting at `velocity` (units per second).
 * The one place the book touches motion's animation engine, so component
 * tests can swap it for a stand-in they control.
 */
export function runSpring(value: MotionValue<number>, to: number, spring: SpringConfig, velocity: number): SpringHandle {
  const controls = animate(value, to, { ...spring, velocity });
  return {
    stop: () => controls.stop(),
    finished: controls.finished.then(() => undefined),
  };
}
