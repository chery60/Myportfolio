import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { flattenPages } from "@/lib/book/pages";
import type { Block } from "@/lib/book/types";
import { FIXTURE_BOOK, fixtureImage } from "@/test/book-fixture";
import { BookPageView } from "./book-page";
import { PageBlock } from "./page-blocks";

function renderBlock(block: Block, index = 0) {
  return render(<PageBlock block={block} index={index} decorative={false} />);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("PageBlock", () => {
  test("renders a heading as a level-3 heading", () => {
    renderBlock({ kind: "heading", text: "Too many orders" });

    expect(screen.getByRole("heading", { level: 3, name: "Too many orders" })).toBeInTheDocument();
  });

  test("renders kicker, body paragraphs and handwritten notes as text", () => {
    const { container } = render(
      <>
        <PageBlock block={{ kind: "kicker", text: "Field notes" }} index={0} decorative={false} />
        <PageBlock block={{ kind: "body", paragraphs: ["First.", "Second."] }} index={1} decorative={false} />
        <PageBlock block={{ kind: "note", text: "Scribbled", align: "end" }} index={2} decorative={false} />
      </>,
    );

    expect(screen.getByText("Field notes")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(4);
    expect(screen.getByText("Scribbled")).toHaveAttribute("data-align", "end");
  });

  test("renders ordered and unordered lists", () => {
    renderBlock({ kind: "list", items: ["one", "two"], ordered: true });
    renderBlock({ kind: "list", items: ["three"] });

    expect(screen.getAllByRole("list").map((list) => list.tagName)).toEqual(["OL", "UL"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  test("renders an image with its description, caption and base-path URL", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Myportfolio");

    renderBlock({ kind: "image", image: fixtureImage("journey"), caption: "The journey", tape: "top" });

    const img = screen.getByRole("img", { name: "journey diagram" });
    expect(img).toHaveAttribute("src", "/Myportfolio/fixture/journey.png");
    expect(img).toHaveAttribute("width", "1920");
    expect(img).toHaveAttribute("draggable", "false");
    expect(screen.getByText("The journey").tagName).toBe("FIGCAPTION");
  });

  test("keeps photo tilt within a few degrees", () => {
    const { container } = renderBlock({ kind: "image", image: fixtureImage("tilted"), tilt: 12 });

    expect(container.querySelector("[data-tape]")?.getAttribute("style")).toContain("--tilt: 3deg");
  });

  test("alternates a small default tilt by position", () => {
    const first = renderBlock({ kind: "image", image: fixtureImage("a") }, 0);
    const second = renderBlock({ kind: "image", image: fixtureImage("b") }, 1);

    const tilts = [first, second].map((r) => r.container.querySelector("[data-tape]")?.getAttribute("style"));
    expect(tilts[0]).not.toBe(tilts[1]);
  });

  test("renders a strip of screens", () => {
    renderBlock({ kind: "screens", images: [fixtureImage("a"), fixtureImage("b"), fixtureImage("c")], caption: "Screens" });

    const figure = screen.getByRole("figure");
    expect(within(figure).getAllByRole("img")).toHaveLength(3);
    expect(within(figure).getByText("Screens")).toBeInTheDocument();
  });

  test("renders a callout whose external links open in a new tab", () => {
    renderBlock({
      kind: "callout",
      label: "Handoff",
      text: "Shipped to developers.",
      links: [
        { label: "Watch", href: "https://example.com/video" },
        { label: "Read on", href: "#case-study" },
      ],
    });

    expect(screen.getByText("Handoff")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Watch" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Read on" })).not.toHaveAttribute("target");
  });

  test("decorative copies carry no alt text", () => {
    render(<PageBlock block={{ kind: "image", image: fixtureImage("copy") }} index={0} decorative />);

    expect(document.querySelector("img")).toHaveAttribute("alt", "");
  });
});

describe("BookPageView", () => {
  const pages = flattenPages(FIXTURE_BOOK);

  test("is announced as a numbered page", () => {
    render(<BookPageView flat={pages[1]} total={pages.length} spine="left" decorative={false} />);

    expect(screen.getByRole("group", { name: "Page 2 of 6" })).toHaveAttribute("aria-roledescription", "page");
  });

  test("decorative copies are hidden from assistive tech and inert", () => {
    const { container } = render(<BookPageView flat={pages[0]} total={pages.length} spine="right" decorative />);
    const page = container.firstElementChild;

    expect(page).toHaveAttribute("aria-hidden", "true");
    expect(page).toHaveAttribute("inert");
    expect(screen.queryByRole("group")).toBeNull();
  });

  test("marks which edge the spine is on", () => {
    const { container } = render(<BookPageView flat={pages[0]} total={pages.length} spine="right" decorative={false} />);

    expect(container.firstElementChild).toHaveAttribute("data-spine", "right");
  });
});
