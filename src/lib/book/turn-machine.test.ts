import { describe, expect, test } from "vitest";
import { type BookAction, type BookState, bookReducer, canStep, createBookState, sceneFor } from "./turn-machine";

const TOTAL = 6; // three spreads

function run(state: BookState, ...actions: BookAction[]): BookState {
  return actions.reduce(bookReducer, state);
}

function settledId(state: BookState): number {
  if (!state.turn) {
    throw new Error("expected a turn in progress");
  }
  return state.turn.id;
}

describe("createBookState", () => {
  test("opens on the first page in spread layout with nothing moving", () => {
    expect(createBookState(TOTAL)).toEqual({
      page: 0,
      layout: "spread",
      total: TOTAL,
      turn: null,
      queued: null,
      navCount: 0,
      seq: 0,
    });
  });

  test("accepts a starting layout", () => {
    expect(createBookState(TOTAL, "single").layout).toBe("single");
  });
});

describe("begin", () => {
  test("a step starts a committed, settling turn toward the next spread", () => {
    const state = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });

    expect(state.turn).toMatchObject({ dir: "next", fromPage: 0, toPage: 2, source: "step", phase: "settling", commit: true });
    expect(state.page).toBe(0);
  });

  test("a drag starts an uncommitted turn that follows the pointer", () => {
    const state = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "drag" });

    expect(state.turn).toMatchObject({ phase: "dragging", commit: false, source: "drag" });
  });

  test("gives every turn a fresh id", () => {
    const first = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });
    const second = run(first, { type: "settled", id: settledId(first) }, { type: "begin", dir: "next", source: "step" });

    expect(settledId(second)).not.toBe(settledId(first));
  });

  test("does nothing past the ends of the book", () => {
    const start = createBookState(TOTAL);

    expect(bookReducer(start, { type: "begin", dir: "prev", source: "step" })).toBe(start);
  });

  test("queues a step that arrives while a turn is settling; the newest wins", () => {
    const turning = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });
    const queued = run(turning, { type: "begin", dir: "prev", source: "step" }, { type: "begin", dir: "next", source: "step" });

    expect(queued.queued).toBe("next");
    expect(queued.turn).toBe(turning.turn);
  });

  test("ignores a drag while any turn is running", () => {
    const turning = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });

    expect(bookReducer(turning, { type: "begin", dir: "next", source: "drag" })).toBe(turning);
  });

  test("ignores a step while the reader is still dragging", () => {
    const dragging = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "drag" });

    expect(bookReducer(dragging, { type: "begin", dir: "next", source: "step" })).toBe(dragging);
  });
});

describe("release", () => {
  test("hands a dragged turn to the spring with the reader's decision", () => {
    const dragging = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "drag" });

    expect(bookReducer(dragging, { type: "release", commit: true }).turn).toMatchObject({ phase: "settling", commit: true });
    expect(bookReducer(dragging, { type: "release", commit: false }).turn).toMatchObject({ phase: "settling", commit: false });
  });

  test("is ignored when nothing is being dragged", () => {
    const idle = createBookState(TOTAL);
    const settling = bookReducer(idle, { type: "begin", dir: "next", source: "step" });

    expect(bookReducer(idle, { type: "release", commit: true })).toBe(idle);
    expect(bookReducer(settling, { type: "release", commit: false })).toBe(settling);
  });
});

describe("settled", () => {
  test("a committed turn lands on its target page and counts as navigation", () => {
    const turning = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });
    const landed = bookReducer(turning, { type: "settled", id: settledId(turning) });

    expect(landed).toMatchObject({ page: 2, turn: null, navCount: 1 });
  });

  test("a cancelled turn springs back to where it started", () => {
    const dragging = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "drag" });
    const cancelled = run(dragging, { type: "release", commit: false }, { type: "settled", id: settledId(dragging) });

    expect(cancelled).toMatchObject({ page: 0, turn: null, navCount: 0 });
  });

  test("ignores a stale settle from an earlier turn", () => {
    const turning = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });

    expect(bookReducer(turning, { type: "settled", id: settledId(turning) + 99 })).toBe(turning);
    expect(bookReducer(createBookState(TOTAL), { type: "settled", id: 1 })).toEqual(createBookState(TOTAL));
  });

  test("starts the queued step as soon as the current turn lands", () => {
    const turning = run(
      createBookState(TOTAL),
      { type: "begin", dir: "next", source: "step" },
      { type: "begin", dir: "next", source: "step" },
    );
    const chained = bookReducer(turning, { type: "settled", id: settledId(turning) });

    expect(chained.page).toBe(2);
    expect(chained.queued).toBeNull();
    expect(chained.turn).toMatchObject({ fromPage: 2, toPage: 4, source: "step", phase: "settling", commit: true });
  });

  test("drops a queued step that would run past the end", () => {
    const nearEnd = { ...createBookState(TOTAL), page: 2 };
    const turning = run(nearEnd, { type: "begin", dir: "next", source: "step" }, { type: "begin", dir: "next", source: "step" });
    const landed = bookReducer(turning, { type: "settled", id: settledId(turning) });

    expect(landed).toMatchObject({ page: 4, turn: null, queued: null });
  });
});

describe("jump", () => {
  test("moves straight to a page and counts as navigation", () => {
    expect(bookReducer(createBookState(TOTAL), { type: "jump", page: 4 })).toMatchObject({ page: 4, navCount: 1 });
  });

  test("clamps to the book", () => {
    expect(bookReducer(createBookState(TOTAL), { type: "jump", page: 99 }).page).toBe(5);
    expect(bookReducer({ ...createBookState(TOTAL), page: 3 }, { type: "jump", page: -4 }).page).toBe(0);
  });

  test("does nothing when already there or while a turn is running", () => {
    const idle = createBookState(TOTAL);
    const turning = bookReducer(idle, { type: "begin", dir: "next", source: "step" });

    expect(bookReducer(idle, { type: "jump", page: 0 })).toBe(idle);
    expect(bookReducer(turning, { type: "jump", page: 4 })).toBe(turning);
  });
});

describe("set-layout", () => {
  test("returns the same state when the layout has not changed", () => {
    const idle = createBookState(TOTAL);

    expect(bookReducer(idle, { type: "set-layout", layout: "spread" })).toBe(idle);
  });

  test("keeps the reader on the same page", () => {
    const onPage = { ...createBookState(TOTAL), page: 3 };

    expect(bookReducer(onPage, { type: "set-layout", layout: "single" })).toMatchObject({ page: 3, layout: "single" });
  });

  test("finishes a settling commit before switching", () => {
    const turning = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });

    expect(bookReducer(turning, { type: "set-layout", layout: "single" })).toMatchObject({
      page: 2,
      turn: null,
      queued: null,
      layout: "single",
    });
  });

  test("abandons a drag or a cancel before switching", () => {
    const dragging = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "drag" });

    expect(bookReducer(dragging, { type: "set-layout", layout: "single" })).toMatchObject({ page: 0, turn: null });
  });
});

describe("canStep", () => {
  test("reports whether a turn in each direction has somewhere to land", () => {
    const start = createBookState(TOTAL);
    const end = { ...start, page: 4 };

    expect([canStep(start, "prev"), canStep(start, "next")]).toEqual([false, true]);
    expect([canStep(end, "prev"), canStep(end, "next")]).toEqual([true, false]);
  });
});

describe("sceneFor", () => {
  test("shows the visible pages when nothing is moving", () => {
    expect(sceneFor({ ...createBookState(TOTAL), page: 3 })).toEqual({ kind: "static", pages: [2, 3] });
    expect(sceneFor({ ...createBookState(TOTAL, "single"), page: 3 })).toEqual({ kind: "static", pages: [3] });
  });

  test("spread, next: the right page lifts off the spine onto the next spread", () => {
    const state = bookReducer(createBookState(TOTAL), { type: "begin", dir: "next", source: "step" });

    expect(sceneFor(state)).toEqual({ kind: "turn", layout: "spread", base: [0, 3], front: 1, back: 2, from: 0, to: 1 });
  });

  test("spread, prev: the same leaf travels the other way", () => {
    const state = bookReducer({ ...createBookState(TOTAL), page: 2 }, { type: "begin", dir: "prev", source: "step" });

    expect(sceneFor(state)).toEqual({ kind: "turn", layout: "spread", base: [0, 3], front: 1, back: 2, from: 1, to: 0 });
  });

  test("single, next: the current page lifts off the left edge over the next one", () => {
    const state = bookReducer({ ...createBookState(TOTAL, "single"), page: 1 }, { type: "begin", dir: "next", source: "step" });

    expect(sceneFor(state)).toEqual({ kind: "turn", layout: "single", base: [2], front: 1, back: null, from: 0, to: 1 });
  });

  test("single, prev: the previous page swings back over the current one", () => {
    const state = bookReducer({ ...createBookState(TOTAL, "single"), page: 2 }, { type: "begin", dir: "prev", source: "step" });

    expect(sceneFor(state)).toEqual({ kind: "turn", layout: "single", base: [2], front: 1, back: null, from: 1, to: 0 });
  });
});
