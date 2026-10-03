/**
 * The book with reduced motion (the test default): every move is an instant
 * jump, so these tests cover navigation, layout and accessibility without
 * the page-turn animation. Turning is covered in turn.test.tsx.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { symphonyKiosk } from "@/data/books/symphony-kiosk";
import { triggerResize } from "@/test/browser-stubs";
import { FIXTURE_BOOK } from "@/test/book-fixture";
import { ProjectBook } from "./project-book";

function renderBook(book = FIXTURE_BOOK) {
  const utils = render(<ProjectBook book={book} />);
  const frame = utils.container.querySelector<HTMLElement>("[data-book-frame]");
  const stage = utils.container.querySelector<HTMLElement>("[data-book-stage]");
  if (!frame || !stage) {
    throw new Error("book frame or stage missing");
  }
  return { ...utils, frame, stage };
}

function visiblePageLabels(): string[] {
  return screen
    .queryAllByRole("group")
    .map((group) => group.getAttribute("aria-label") ?? "")
    .filter((label) => label.startsWith("Page "));
}

function liveText(container: HTMLElement): string {
  return container.querySelector("[aria-live]")?.textContent ?? "";
}

const next = () => screen.getByRole("button", { name: "Next page" });
const prev = () => screen.getByRole("button", { name: "Previous page" });

describe("ProjectBook", () => {
  test("is a labelled book region", () => {
    renderBook();

    const region = screen.getByRole("region", { name: "Fixture Project: project notebook" });
    expect(region).toHaveAttribute("aria-roledescription", "book");
  });

  test("opens on the first spread and shows only its two pages", () => {
    renderBook();

    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
    expect(screen.getByRole("heading", { level: 3, name: "The problem heading" })).toBeInTheDocument();
  });

  test("can't go back from the first spread", () => {
    renderBook();

    expect(prev()).toHaveAttribute("aria-disabled", "true");
    expect(next()).toHaveAttribute("aria-disabled", "false");
  });

  test("turns to the next spread and announces it", async () => {
    const { container } = renderBook();
    expect(liveText(container)).toBe("");

    await userEvent.click(next());

    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
    expect(liveText(container)).toBe("Spread 2 of 3: Who's ordering");
    expect(screen.getByText("Spread 2 / 3")).toBeInTheDocument();
  });

  test("ignores the disabled button at either end", async () => {
    renderBook();

    await userEvent.click(prev());

    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("turns pages with the keyboard while the book has focus", () => {
    const { stage } = renderBook();

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);

    fireEvent.keyDown(stage, { key: "End" });
    expect(visiblePageLabels()).toEqual(["Page 5 of 6", "Page 6 of 6"]);
    expect(next()).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);

    fireEvent.keyDown(stage, { key: "Home" });
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("leaves modified key presses to the browser", () => {
    const { stage } = renderBook();

    fireEvent.keyDown(stage, { key: "ArrowRight", altKey: true });

    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("shows one page at a time on a narrow frame", async () => {
    const { frame, container } = renderBook();

    act(() => triggerResize(frame, 390));
    expect(visiblePageLabels()).toEqual(["Page 1 of 6"]);

    await userEvent.click(next());
    expect(visiblePageLabels()).toEqual(["Page 2 of 6"]);
    expect(liveText(container)).toBe("Page 2 of 6: The problem");
    expect(screen.getByText("Page 2 / 6")).toBeInTheDocument();
  });

  test("keeps the reader's place when the layout changes", async () => {
    const { frame } = renderBook();
    act(() => triggerResize(frame, 960));

    await userEvent.click(next());
    await userEvent.click(next());
    act(() => triggerResize(frame, 390));
    expect(visiblePageLabels()).toEqual(["Page 5 of 6"]);

    await userEvent.click(next());
    act(() => triggerResize(frame, 960));
    expect(visiblePageLabels()).toEqual(["Page 5 of 6", "Page 6 of 6"]);
  });

  test("shows the open spread's caption", async () => {
    renderBook();
    expect(screen.getByText("The problem caption")).toBeInTheDocument();

    await userEvent.click(next());

    expect(screen.getByText("Who's ordering caption")).toBeInTheDocument();
  });

  test("keeps keyboard focus in the book when a focused link's page turns away", () => {
    const { stage } = renderBook(symphonyKiosk);
    fireEvent.keyDown(stage, { key: "End" });
    const link = screen.getByRole("link", { name: "Read the full case study" });
    link.focus();

    fireEvent.keyDown(link, { key: "ArrowLeft" });

    expect(screen.queryByRole("link", { name: "Read the full case study" })).toBeNull();
    expect(stage).toHaveFocus();
  });

  test("renders the real Symphony Kiosk book", () => {
    renderBook(symphonyKiosk);

    expect(screen.getByRole("region", { name: "Symphony Kiosk: project notebook" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Too many orders, too few hands" })).toBeInTheDocument();
    expect(screen.getByText("Spread 1 / 9")).toBeInTheDocument();
  });
});
