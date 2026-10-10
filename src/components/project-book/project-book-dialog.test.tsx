import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { ProjectBook } from "@/lib/book/types";
import { FIXTURE_BOOK } from "@/test/book-fixture";
import { ProjectBookDialog } from "./project-book-dialog";

const FONT_CLASSES = "book-fonts";

/** The fixture with an in-page link on its first page. */
function bookWithLink(href: string): ProjectBook {
  return {
    ...FIXTURE_BOOK,
    spreads: FIXTURE_BOOK.spreads.map((spread, index) =>
      index === 0
        ? {
            ...spread,
            left: {
              ...spread.left,
              blocks: [
                {
                  kind: "callout",
                  label: "Handoff",
                  text: "Shipped in phases.",
                  links: [{ label: "Read the case study", href }],
                },
              ],
            },
          }
        : spread,
    ),
  };
}

function renderDialog(book: ProjectBook = FIXTURE_BOOK) {
  return render(
    <>
      <ProjectBookDialog book={book} fontClassName={FONT_CLASSES} />
      <article id="case-study">The case study</article>
    </>,
  );
}

const trigger = () => screen.getByRole("button", { name: "Open notebook" });
const dialog = () => screen.getByRole("dialog", { name: "Fixture Project" });
const stage = () => within(dialog()).getByRole("group", { name: "Pages" });

function visiblePageLabels(): string[] {
  return within(dialog())
    .queryAllByRole("group")
    .map((group) => group.getAttribute("aria-label") ?? "")
    .filter((label) => label.startsWith("Page "));
}

async function openNotebook() {
  await userEvent.click(trigger());
  await waitFor(() => expect(stage()).toHaveFocus());
}

describe("the notebook dialog", () => {
  test("offers a button that opens a dialog, with no book on the page until then", () => {
    renderDialog();

    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).toHaveClass(FONT_CLASSES);
    expect(screen.queryByRole("group", { name: "Pages" })).toBeNull();
  });

  test("opens the book in a dialog named after the project, ready to turn", async () => {
    renderDialog();

    await openNotebook();

    expect(dialog()).toHaveClass(FONT_CLASSES);
    expect(within(dialog()).getByText("Project notebook, 6 pages")).toBeInTheDocument();
    expect(visiblePageLabels()).toEqual(["Page 1 of 6", "Page 2 of 6"]);
  });

  test("turns pages with the arrow keys", async () => {
    renderDialog();
    await openNotebook();

    fireEvent.keyDown(stage(), { key: "ArrowRight" });

    expect(visiblePageLabels()).toEqual(["Page 3 of 6", "Page 4 of 6"]);
  });

  test("Escape on the magnifier puts the glass away and keeps the book open", async () => {
    renderDialog();
    await openNotebook();
    const glass = within(dialog()).getByRole("group", { name: "Magnifier" });
    glass.focus();

    fireEvent.keyDown(glass, { key: "Escape" });

    await waitFor(() => expect(within(dialog()).queryByRole("group", { name: "Magnifier" })).toBeNull());
    expect(dialog()).toBeInTheDocument();
  });

  test("Escape on the book closes the dialog and returns focus to the button", async () => {
    renderDialog();
    await openNotebook();

    fireEvent.keyDown(stage(), { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  test("an in-page link closes the dialog, scrolls to its target and moves focus there", async () => {
    renderDialog(bookWithLink("#case-study"));
    const article = document.getElementById("case-study");
    if (!article) {
      throw new Error("article missing");
    }
    article.scrollIntoView = vi.fn();
    await openNotebook();

    fireEvent.click(within(dialog()).getByRole("link", { name: "Read the case study" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(article.scrollIntoView).toHaveBeenCalled());
    // Keyboard and screen-reader users carry on reading from there, not from the top.
    expect(article).toHaveFocus();
  });

  test("a malformed in-page link still closes the dialog", async () => {
    renderDialog(bookWithLink("#100%"));
    await openNotebook();

    fireEvent.click(within(dialog()).getByRole("link", { name: "Read the case study" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
