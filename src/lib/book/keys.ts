/**
 * Keyboard vocabulary for the book and its magnifying glass. Modifier chords
 * (Alt/Ctrl/Meta) always pass through to the browser.
 */
import type { GlassMove } from "./loupe-geometry";

export interface KeyInput {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export type BookCommand = "prev" | "next" | "first" | "last";

export type GlassCommand = { kind: "move"; move: GlassMove; fast: boolean } | { kind: "park" } | { kind: "close" };

const BOOK_KEYS: Readonly<Record<string, BookCommand>> = {
  ArrowLeft: "prev",
  PageUp: "prev",
  ArrowRight: "next",
  PageDown: "next",
  Home: "first",
  End: "last",
};

const GLASS_MOVES: Readonly<Record<string, GlassMove>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

function isChord(event: KeyInput): boolean {
  return event.altKey || event.ctrlKey || event.metaKey;
}

export function keyToBookCommand(event: KeyInput): BookCommand | null {
  if (isChord(event) || !Object.hasOwn(BOOK_KEYS, event.key)) {
    return null;
  }
  return BOOK_KEYS[event.key];
}

export function keyToGlassCommand(event: KeyInput): GlassCommand | null {
  if (isChord(event)) {
    return null;
  }
  if (Object.hasOwn(GLASS_MOVES, event.key)) {
    return { kind: "move", move: GLASS_MOVES[event.key], fast: event.shiftKey };
  }
  if (event.key === "Home") {
    return { kind: "park" };
  }
  if (event.key === "Escape") {
    return { kind: "close" };
  }
  return null;
}
