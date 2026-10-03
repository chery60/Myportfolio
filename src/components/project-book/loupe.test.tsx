import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

function renderBook() {
  const utils = render(<ProjectBook book={FIXTURE_BOOK} />);
  const stage = utils.container.querySelector<HTMLElement>("[data-book-stage]");
  const frame = utils.container.querySelector<HTMLElement>("[data-book-frame]");
  if (!stage || !frame) {
    throw new Error("stage missing");
  }
  Object.defineProperty(stage, "clientWidth", { value: STAGE.width, configurable: true });
  Object.defineProperty(stage, "clientHeight", { value: STAGE.height, configurable: true });
  const rect = { left: 0, top: 0, right: STAGE.width, bottom: STAGE.height, x: 0, y: 0, ...STAGE };
  stage.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect }) as DOMRect;
  act(() => triggerResize(frame, 960));
  return { ...utils, stage };
}

const toggle = () => screen.getByRole("button", { name: "Magnifier" });
const glass = () => screen.getByRole("group", { name: "Magnifier" });

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
  test("toggles on and off from the toolbar", async () => {
    renderBook();
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("group", { name: "Magnifier" })).toBeNull();

    await userEvent.click(toggle());

    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(glass()).toHaveAttribute("aria-roledescription", "magnifier");

    await userEvent.click(toggle());

    await waitFor(() => expect(screen.queryByRole("group", { name: "Magnifier" })).toBeNull());
  });

  test("parks in the bottom-right corner of the book", async () => {
    renderBook();

    await userEvent.click(toggle());

    // Diameter: 800 × 0.235 = 188 → radius 94; centre parks 12px in from the corner.
    expect(glassTransform()).toBe(`translate3d(${800 - 94 - 12 - 94}px, ${533 - 94 - 12 - 94}px, 0)`);
    expect(glass().style.getPropertyValue("--glass-d")).toBe("188px");
  });

  test("magnifies a decorative copy of the open pages", async () => {
    const { container } = renderBook();

    await userEvent.click(toggle());

    const lens = container.querySelector("[data-lens]");
    expect(lens).toHaveAttribute("aria-hidden", "true");
    expect(lens).toHaveAttribute("inert");
    expect(lens?.querySelectorAll("[data-page]")).toHaveLength(2);
    expect(container.querySelector<HTMLElement>("[data-lens-content]")?.style.transform).toContain("scale(2.3)");
  });

  test("moves with the arrow keys without turning the page", async () => {
    renderBook();
    await userEvent.click(toggle());
    const before = glassTransform();

    fireEvent.keyDown(glass(), { key: "ArrowLeft" });

    expect(glassTransform()).not.toBe(before);
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("closes with Escape and hands focus back to the toggle", async () => {
    renderBook();
    await userEvent.click(toggle());

    fireEvent.keyDown(glass(), { key: "Escape" });

    expect(toggle()).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("group", { name: "Magnifier" })).toBeNull());
  });

  test("takes focus when opened from the keyboard", async () => {
    renderBook();
    toggle().focus();

    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(glass()).toHaveFocus());
  });

  test("follows a drag", async () => {
    renderBook();
    await userEvent.click(toggle());
    const parked = { x: 800 - 94 - 12, y: 533 - 94 - 12 };

    fireEvent.pointerDown(glass(), { clientX: parked.x, clientY: parked.y, pointerId: 7, button: 0 });
    fireEvent.pointerMove(glass(), { clientX: 300, clientY: 200, pointerId: 7 });
    fireEvent.pointerUp(glass(), { clientX: 300, clientY: 200, pointerId: 7 });

    expect(glassTransform()).toBe(`translate3d(${300 - 94}px, ${200 - 94}px, 0)`);
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("a tap on the book places the glass instead of turning the page", async () => {
    const { stage } = renderBook();
    await userEvent.click(toggle());

    fireEvent.pointerDown(stage, { clientX: 600, clientY: 150, pointerId: 1, button: 0, isPrimary: true });
    fireEvent.pointerUp(stage, { clientX: 600, clientY: 150, pointerId: 1, isPrimary: true });

    expect(glassTransform()).toBe(`translate3d(${600 - 94}px, ${150 - 94}px, 0)`);
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("keeps gliding to its corner when a quick turn lands first", async () => {
    setMediaMatches(REDUCED_MOTION_QUERY, false);
    const { stage } = renderBook();
    await userEvent.click(toggle());
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
    expect(glassTransform()).toBe(`translate3d(${800 - 94 - 12 - 94}px, ${533 - 94 - 12 - 94}px, 0)`);
  });

  test("moves out of the way when a page turns", async () => {
    setMediaMatches(REDUCED_MOTION_QUERY, false);
    const { stage } = renderBook();
    await userEvent.click(toggle());
    fireEvent.keyDown(glass(), { key: "ArrowUp", shiftKey: true });
    const nudged = glassTransform();

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    await flushSprings();

    expect(nudged).not.toBe(glassTransform());
    expect(glassTransform()).toBe(`translate3d(${800 - 94 - 12 - 94}px, ${533 - 94 - 12 - 94}px, 0)`);
  });
});
