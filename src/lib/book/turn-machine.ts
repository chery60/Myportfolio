/**
 * Which page the book is open at, and the one page turn that may be in
 * flight. Pure: the React hooks own timing and physics, this owns rules.
 *
 * The position is always a flat page index. Spread layout shows the spread
 * that page belongs to and steps two pages at a time; single layout shows
 * the page itself. Keeping one canonical index means switching layouts
 * (rotating a phone, resizing a window) never loses the reader's place.
 */
import { spreadIndexOf, stepTarget, visiblePageIndices } from "./pages";
import type { BookLayout, TurnDirection } from "./types";

export type TurnSource = "drag" | "step";

export interface Turn {
  id: number;
  dir: TurnDirection;
  fromPage: number;
  toPage: number;
  source: TurnSource;
  /** `dragging` follows the pointer; `settling` is the spring finishing the move. */
  phase: "dragging" | "settling";
  /** Whether the settling spring lands on `toPage` (true) or returns to `fromPage`. */
  commit: boolean;
}

export interface BookState {
  page: number;
  layout: BookLayout;
  total: number;
  turn: Turn | null;
  /** One step requested while a turn was settling; it runs when that turn lands. */
  queued: TurnDirection | null;
  /** Completed navigations; zero means the reader has not moved yet. */
  navCount: number;
  seq: number;
}

export type BookAction =
  | { type: "begin"; dir: TurnDirection; source: TurnSource }
  | { type: "release"; commit: boolean }
  | { type: "settled"; id: number }
  | { type: "jump"; page: number }
  | { type: "set-layout"; layout: BookLayout };

export type TurnScene =
  | { kind: "static"; pages: readonly number[] }
  | {
      kind: "turn";
      layout: "spread";
      base: readonly [number, number];
      front: number;
      back: number;
      from: 0 | 1;
      to: 0 | 1;
    }
  | {
      kind: "turn";
      layout: "single";
      base: readonly [number];
      front: number;
      back: null;
      from: 0 | 1;
      to: 0 | 1;
    };

export function createBookState(total: number, layout: BookLayout = "spread"): BookState {
  return { page: 0, layout, total, turn: null, queued: null, navCount: 0, seq: 0 };
}

export function canStep(state: BookState, dir: TurnDirection): boolean {
  return stepTarget(state.page, dir, state.layout, state.total) !== null;
}

function startTurn(state: BookState, dir: TurnDirection, source: TurnSource): BookState {
  const toPage = stepTarget(state.page, dir, state.layout, state.total);
  if (toPage === null) {
    return state;
  }
  const seq = state.seq + 1;
  const isStep = source === "step";
  const turn: Turn = {
    id: seq,
    dir,
    fromPage: state.page,
    toPage,
    source,
    phase: isStep ? "settling" : "dragging",
    commit: isStep,
  };
  return { ...state, seq, turn };
}

function begin(state: BookState, dir: TurnDirection, source: TurnSource): BookState {
  if (!state.turn) {
    return startTurn(state, dir, source);
  }
  if (source === "step" && state.turn.phase === "settling") {
    return state.queued === dir ? state : { ...state, queued: dir };
  }
  return state;
}

function settle(state: BookState, id: number): BookState {
  const { turn } = state;
  if (!turn || turn.id !== id) {
    return state;
  }
  const landed: BookState = turn.commit
    ? { ...state, page: turn.toPage, navCount: state.navCount + 1, turn: null, queued: null }
    : { ...state, turn: null, queued: null };
  return state.queued ? startTurn(landed, state.queued, "step") : landed;
}

function jump(state: BookState, page: number): BookState {
  const target = Math.min(Math.max(page, 0), state.total - 1);
  if (state.turn || target === state.page) {
    return state;
  }
  return { ...state, page: target, navCount: state.navCount + 1 };
}

function setLayout(state: BookState, layout: BookLayout): BookState {
  if (layout === state.layout) {
    return state;
  }
  const { turn } = state;
  const landsOnTarget = turn?.phase === "settling" && turn.commit;
  return {
    ...state,
    layout,
    page: landsOnTarget ? turn.toPage : state.page,
    navCount: landsOnTarget ? state.navCount + 1 : state.navCount,
    turn: null,
    queued: null,
  };
}

export function bookReducer(state: BookState, action: BookAction): BookState {
  switch (action.type) {
    case "begin":
      return begin(state, action.dir, action.source);
    case "release":
      return state.turn?.phase === "dragging"
        ? { ...state, turn: { ...state.turn, phase: "settling", commit: action.commit } }
        : state;
    case "settled":
      return settle(state, action.id);
    case "jump":
      return jump(state, action.page);
    case "set-layout":
      return setLayout(state, action.layout);
  }
}

/**
 * Which page sits where while a turn is in flight.
 *
 * One leaf model serves both directions: at progress 0 the leaf lies flat
 * over the lower view showing `front`; at progress 1 it has swung over and
 * shows `back`. Next animates 0→1, prev 1→0. At either endpoint the scene is
 * pixel-identical to the static view, so swapping between them never flashes.
 */
export function sceneFor(state: BookState): TurnScene {
  const { turn } = state;
  if (!turn) {
    return { kind: "static", pages: visiblePageIndices(state.page, state.layout) };
  }
  const forward = turn.dir === "next";
  const from = forward ? 0 : 1;
  const to = forward ? 1 : 0;
  const lower = Math.min(turn.fromPage, turn.toPage);
  const higher = Math.max(turn.fromPage, turn.toPage);

  if (state.layout === "single") {
    return { kind: "turn", layout: "single", base: [higher], front: lower, back: null, from, to };
  }
  const lowerLeft = spreadIndexOf(lower) * 2;
  const higherLeft = spreadIndexOf(higher) * 2;
  return {
    kind: "turn",
    layout: "spread",
    base: [lowerLeft, higherLeft + 1],
    front: lowerLeft + 1,
    back: higherLeft,
    from,
    to,
  };
}
