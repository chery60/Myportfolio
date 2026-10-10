import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import type { MotionValue } from "motion/react";
import { describe, expect, test, vi } from "vitest";
import { REDUCED_MOTION_QUERY } from "@/components/use-media-query";
import { setMediaMatches, triggerResize } from "@/test/browser-stubs";
import { FIXTURE_BOOK } from "@/test/book-fixture";
import { ProjectBook } from "./project-book";

interface FakeSpring {
  finish: () => void;
  stopped: boolean;
}

const springs: FakeSpring[] = [];

vi.mock("./turn-animator", () => ({
  runSpring: (value: MotionValue<number>, to: number) => {
    let resolve: () => void = () => {};
    const finished = new Promise<void>((r) => {
      resolve = r;
    });
    const spring: FakeSpring = {
      finish: () => {
        value.jump(to);
        resolve();
      },
      stopped: false,
    };
    springs.push(spring);
    return {
      stop: () => {
        spring.stopped = true;
      },
      finished,
    };
  },
}));

const STAGE = { width: 800, height: 533 };
/** A roomy frame: its right edge 480px past the book's, room for the handle. */
const WIDE_FRAME_RIGHT = 1280;

// Diameter 800 × 0.235 = 188 (radius 94). At rest the centre sits 0.33 × 188
// in from the right edge and 0.08 × 188 below the bottom edge.
const PARKED = { x: 800 - 62.04, y: 533 + 15.04 };
const PARKED_TRANSFORM = "translate3d(643.96px, 454.04px, 0)";

function stubRect(element: HTMLElement, rect: { left: number; right: number; top: number; bottom: number }) {
  const full = { ...rect, x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top };
  element.getBoundingClientRect = () => ({ ...full, toJSON: () => full }) as DOMRect;
}

function setFrameRight(frame: HTMLElement, right: number) {
  stubRect(frame, { left: 0, top: 0, right, bottom: STAGE.height });
}

function renderBook(frameRight = WIDE_FRAME_RIGHT) {
  const utils = render(<ProjectBook book={FIXTURE_BOOK} />);
  const stage = utils.container.querySelector<HTMLElement>("[data-book-stage]");
  const frame = utils.container.querySelector<HTMLElement>("[data-book-frame]");
  if (!stage || !frame) {
    throw new Error("stage missing");
  }
  Object.defineProperty(stage, "clientWidth", { value: STAGE.width, configurable: true });
  Object.defineProperty(stage, "clientHeight", { value: STAGE.height, configurable: true });
  stubRect(stage, { left: 0, top: 0, right: STAGE.width, bottom: STAGE.height });
  setFrameRight(frame, frameRight);
  act(() => {
    triggerResize(frame, 960);
    triggerResize(stage, STAGE.width, STAGE.height);
  });
  return { ...utils, stage, frame };
}

const toggle = () => screen.getByRole("button", { name: "Magnifier" });
const glass = () => screen.getByRole("group", { name: "Magnifier" });
const queryGlass = () => screen.queryByRole("group", { name: "Magnifier" });

function glassTransform(): string {
  return glass().style.transform;
}

async function flushSprings() {
  await act(async () => {
    for (const spring of springs.splice(0)) {
      spring.finish();
    }
  });
}

function visiblePageLabels(): string[] {
  return screen
    .queryAllByRole("group")
    .map((group) => group.getAttribute("aria-label") ?? "")
    .filter((label) => label.startsWith("Page "));
}

describe("the magnifier", () => {
  test("is left out of the server HTML, so it never shows before it is placed", () => {
    const html = renderToString(<ProjectBook book={FIXTURE_BOOK} />);

    expect(html).not.toContain("data-glass");
    expect(html).toContain('aria-pressed="false"');
  });

  test("rests on the book from the start and toggles from the toolbar", async () => {
    renderBook();
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(glass()).toHaveAttribute("aria-roledescription", "magnifier");

    await userEvent.click(toggle());

    expect(toggle()).toHaveAttribute("aria-pressed", "false");
    await waitFor(() => expect(queryGlass()).toBeNull());

    await userEvent.click(toggle());

    expect(glass()).toBeInTheDocument();
  });

  test("rests off the bottom-right corner of the book", () => {
    renderBook();

    expect(glassTransform()).toBe(PARKED_TRANSFORM);
    expect(glass().style.getPropertyValue("--glass-d")).toBe("188px");
  });

  test("rests further in when the handle would leave a narrow frame", () => {
    // 30px right of the book: the centre may go to 800 + 30 − 0.9 × 188 − 8 = 652.8.
    const { container } = renderBook(830);

    expect(glassTransform()).toBe("translate3d(558.8px, 454.04px, 0)");
    // The lens then has no reason to reach past the book, which would widen the page.
    expect(container.querySelector<HTMLElement>("[data-lens]")?.style.getPropertyValue("--lens-overhang-right")).toBe(
      "0px",
    );
  });

  test("follows the frame while it rests", () => {
    const { frame } = renderBook();

    setFrameRight(frame, 830);
    act(() => triggerResize(frame, 830));

    expect(glassTransform()).toBe("translate3d(558.8px, 454.04px, 0)");
  });

  test("measures its room as laid out, even while an opening animation scales the book", () => {
    const { stage, frame } = renderBook();

    // Drawn at 95%: the 30px of room shows as 28.5px.
    stubRect(stage, { left: 20, top: 13, right: 780, bottom: 519 });
    setFrameRight(frame, 808.5);
    act(() => triggerResize(stage, STAGE.width, STAGE.height));

    expect(glassTransform()).toBe("translate3d(558.8px, 454.04px, 0)");
  });

  test("a moved glass is pulled in when the frame narrows, and steers from there", () => {
    const { frame } = renderBook();
    fireEvent.pointerDown(glass(), { clientX: PARKED.x, clientY: PARKED.y, pointerId: 7, button: 0 });
    fireEvent.pointerMove(glass(), { clientX: 790, clientY: 200, pointerId: 7 });
    fireEvent.pointerUp(glass(), { clientX: 790, clientY: 200, pointerId: 7 });

    setFrameRight(frame, 830);
    act(() => triggerResize(frame, 830));
    // The centre may now go only to 652.8.
    expect(glassTransform()).toBe(`translate3d(558.8px, ${200 - 94}px, 0)`);

    fireEvent.keyDown(glass(), { key: "ArrowLeft" });

    // One step (2% of 800) left of where it is drawn, not of where it was before.
    expect(glassTransform()).toBe(`translate3d(542.8px, ${200 - 94}px, 0)`);
  });

  test("magnifies a decorative copy of the open pages", () => {
    const { container } = renderBook();

    const lens = container.querySelector("[data-lens]");
    expect(lens).toHaveAttribute("aria-hidden", "true");
    expect(lens).toHaveAttribute("inert");
    expect(lens?.querySelectorAll("[data-page]")).toHaveLength(2);
    expect(container.querySelector<HTMLElement>("[data-lens-content]")?.style.transform).toContain("scale(2.3)");
  });

  test("moves with the arrow keys without turning the page", () => {
    renderBook();
    const before = glassTransform();

    fireEvent.keyDown(glass(), { key: "ArrowLeft" });

    expect(glassTransform()).not.toBe(before);
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("closes with Escape and hands focus back to the toggle", async () => {
    renderBook();

    fireEvent.keyDown(glass(), { key: "Escape" });

    expect(toggle()).toHaveFocus();
    await waitFor(() => expect(queryGlass()).toBeNull());
  });

  test("takes focus when brought back from the keyboard", async () => {
    renderBook();
    toggle().focus();

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(queryGlass()).toBeNull());
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(glass()).toHaveFocus());
  });

  test("follows a drag", () => {
    renderBook();

    fireEvent.pointerDown(glass(), { clientX: PARKED.x, clientY: PARKED.y, pointerId: 7, button: 0 });
    fireEvent.pointerMove(glass(), { clientX: 300, clientY: 200, pointerId: 7 });
    fireEvent.pointerUp(glass(), { clientX: 300, clientY: 200, pointerId: 7 });

    expect(glassTransform()).toBe(`translate3d(${300 - 94}px, ${200 - 94}px, 0)`);
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("goes back to rest when put away and brought out again", async () => {
    renderBook();
    fireEvent.pointerDown(glass(), { clientX: PARKED.x, clientY: PARKED.y, pointerId: 7, button: 0 });
    fireEvent.pointerMove(glass(), { clientX: 300, clientY: 200, pointerId: 7 });
    fireEvent.pointerUp(glass(), { clientX: 300, clientY: 200, pointerId: 7 });

    await userEvent.click(toggle());
    await waitFor(() => expect(queryGlass()).toBeNull());
    await userEvent.click(toggle());

    expect(glassTransform()).toBe(PARKED_TRANSFORM);
  });

  test("a tap on the book still turns the page while the glass rests on it", async () => {
    setMediaMatches(REDUCED_MOTION_QUERY, false);
    const { stage } = renderBook();

    fireEvent.pointerDown(stage, { clientX: 600, clientY: 150, pointerId: 1, button: 0, isPrimary: true });
    fireEvent.pointerUp(stage, { clientX: 600, clientY: 150, pointerId: 1, isPrimary: true });

    // Only the page turn runs: a resting glass has nowhere to glide.
    expect(springs).toHaveLength(1);
    await flushSprings();
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
    expect(glassTransform()).toBe(PARKED_TRANSFORM);
  });

  test("keeps gliding to its corner when a quick turn lands first", async () => {
    setMediaMatches(REDUCED_MOTION_QUERY, false);
    const { stage } = renderBook();
    fireEvent.keyDown(glass(), { key: "ArrowUp", shiftKey: true });
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    const [pageTurn, ...glassGlide] = springs;

    // Land only the page turn; the glass is still on its way to the corner.
    await act(async () => {
      springs.shift()?.finish();
    });

    expect(pageTurn).toBeDefined();
    expect(glassGlide).toHaveLength(2);
    expect(glassGlide.some((spring) => spring.stopped)).toBe(false);
    await flushSprings();
    expect(glassTransform()).toBe(PARKED_TRANSFORM);
  });

  test("moves out of the way when a page turns", async () => {
    setMediaMatches(REDUCED_MOTION_QUERY, false);
    const { stage } = renderBook();
    fireEvent.keyDown(glass(), { key: "ArrowUp", shiftKey: true });
    const nudged = glassTransform();

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    await flushSprings();

    expect(nudged).not.toBe(glassTransform());
    expect(glassTransform()).toBe(PARKED_TRANSFORM);
  });
});
