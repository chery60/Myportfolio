/**
 * Page turning with motion allowed. The spring is replaced by a controllable
 * stand-in so tests can look at the book mid-turn, then let it land.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MotionValue } from "motion/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { REDUCED_MOTION_QUERY } from "@/components/use-media-query";
import { STRIP_COUNT } from "@/lib/book/curl-geometry";
import { setMediaMatches, triggerResize } from "@/test/browser-stubs";
import { FIXTURE_BOOK } from "@/test/book-fixture";
import { ProjectBook } from "./project-book";

interface PendingSpring {
  value: MotionValue<number>;
  to: number;
  velocity: number;
  finish: () => void;
}

const springs: PendingSpring[] = [];

vi.mock("./turn-animator", () => ({
  runSpring: (value: MotionValue<number>, to: number, _spring: unknown, velocity: number) => {
    let resolve: () => void = () => {};
    const finished = new Promise<void>((r) => {
      resolve = r;
    });
    springs.push({
      value,
      to,
      velocity,
      finish: () => {
        value.jump(to);
        resolve();
      },
    });
    return { stop: () => {}, finished };
  },
}));

const STAGE_RECT = { left: 0, top: 0, right: 800, bottom: 533, width: 800, height: 533, x: 0, y: 0 };

function renderBook() {
  const utils = render(<ProjectBook book={FIXTURE_BOOK} />);
  const stage = utils.container.querySelector<HTMLElement>("[data-book-stage]");
  const frame = utils.container.querySelector<HTMLElement>("[data-book-frame]");
  if (!stage || !frame) {
    throw new Error("stage missing");
  }
  stage.getBoundingClientRect = () => ({ ...STAGE_RECT, toJSON: () => STAGE_RECT }) as DOMRect;
  act(() => triggerResize(frame, 960));
  return { ...utils, stage, frame };
}

async function landSprings() {
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

function pointer(stage: HTMLElement, type: "pointerDown" | "pointerMove" | "pointerUp" | "pointerCancel", clientX: number) {
  fireEvent[type](stage, { clientX, clientY: 200, pointerId: 1, button: 0, isPrimary: true });
}

beforeEach(() => {
  springs.splice(0);
  setMediaMatches(REDUCED_MOTION_QUERY, false);
});

describe("turning a page", () => {
  test("a step curls the leaf over, then settles on the next spread", async () => {
    const { container } = renderBook();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    const leaf = container.querySelector("[data-leaf]");
    expect(leaf).not.toBeNull();
    expect(leaf).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("[data-strip]")).toHaveLength(STRIP_COUNT);
    expect(container.querySelectorAll("[data-face]")).toHaveLength(STRIP_COUNT * 2);
    expect(container.querySelector("[data-book-stage]")).toHaveAttribute("data-turning");
    const baseSlots = container.querySelectorAll("[data-book-stage] > [data-side]");
    expect([...baseSlots].every((slot) => slot.hasAttribute("inert"))).toBe(true);
    expect(springs).toHaveLength(1);
    expect(springs[0].to).toBe(1);

    await landSprings();

    expect(container.querySelector("[data-leaf]")).toBeNull();
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
  });

  test("writes the curl onto the strips as the spring moves", async () => {
    const { container } = renderBook();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    act(() => springs[0].value.set(0.5));

    const root = container.querySelector<HTMLElement>("[data-strip='0']");
    expect(root?.style.transform).toMatch(/^rotateY\(-2\.1708rad\)$/);
    expect(container.querySelector<HTMLElement>("[data-gutter]")?.style.opacity).not.toBe("0");
  });

  test("turning back runs the same leaf the other way", async () => {
    const { stage } = renderBook();
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    await landSprings();

    fireEvent.keyDown(stage, { key: "ArrowLeft" });

    expect(springs[0].to).toBe(0);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("a step pressed mid-turn runs as soon as the first lands", async () => {
    renderBook();
    const next = screen.getByRole("button", { name: "Next page" });

    await userEvent.click(next);
    await userEvent.click(next);
    await landSprings();
    await landSprings();

    expect(visiblePageLabels()).toEqual(["Page 5 of 6", "Page 6 of 6"]);
  });

  test("dragging the page far enough commits the turn", async () => {
    const { stage, container } = renderBook();

    pointer(stage, "pointerDown", 700);
    pointer(stage, "pointerMove", 400);
    expect(container.querySelector("[data-leaf]")).not.toBeNull();
    pointer(stage, "pointerUp", 400);

    expect(springs.at(-1)?.to).toBe(1);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
  });

  test("a short drag springs back", async () => {
    const { stage } = renderBook();

    pointer(stage, "pointerDown", 700);
    pointer(stage, "pointerMove", 640);
    pointer(stage, "pointerUp", 640);

    expect(springs.at(-1)?.to).toBe(0);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("a cancelled pointer (the page scrolled instead) springs back", async () => {
    const { stage } = renderBook();

    pointer(stage, "pointerDown", 700);
    pointer(stage, "pointerMove", 300);
    pointer(stage, "pointerCancel", 300);

    expect(springs.at(-1)?.to).toBe(0);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("a new press replaces a drag whose release never arrived", async () => {
    const { stage } = renderBook();
    pointer(stage, "pointerDown", 700);
    pointer(stage, "pointerMove", 400);

    fireEvent.pointerDown(stage, { clientX: 700, clientY: 200, pointerId: 2, button: 0, isPrimary: true });

    expect(springs.at(-1)?.to).toBe(0);
    await landSprings();
    fireEvent.pointerUp(stage, { clientX: 702, clientY: 200, pointerId: 2, isPrimary: true });
    expect(springs).toHaveLength(1);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
  });

  test("a vertical swipe is left to the page scroll", () => {
    const { stage, container } = renderBook();

    pointer(stage, "pointerDown", 700);
    fireEvent.pointerMove(stage, { clientX: 702, clientY: 320, pointerId: 1, isPrimary: true });
    pointer(stage, "pointerMove", 400);

    expect(container.querySelector("[data-leaf]")).toBeNull();
  });

  test("tapping the right half turns forward; the left half at the start does nothing", async () => {
    const { stage } = renderBook();

    pointer(stage, "pointerDown", 100);
    pointer(stage, "pointerUp", 101);
    expect(springs).toHaveLength(0);

    pointer(stage, "pointerDown", 700);
    pointer(stage, "pointerUp", 702);
    expect(springs).toHaveLength(1);
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
  });

  test("single-page layout turns one page with a blank back", async () => {
    const { frame, container } = renderBook();
    act(() => triggerResize(frame, 390));

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(container.querySelector("[data-leaf]")).toHaveAttribute("data-layout", "single");
    await landSprings();
    expect(visiblePageLabels()).toEqual(["Page 2 of 6"]);
  });
});
