/**
 * Data model for a project book: a case study told as two-page spreads.
 * Spreads hold two pages; pages hold a short list of typed blocks. The
 * vocabulary is deliberately small so every book reads like the same
 * notebook.
 */

export type BookLayout = "spread" | "single";
export type TurnDirection = "next" | "prev";
export type PageSide = "left" | "right";

/** A public asset. `src` is root-relative and is prefixed with the base path at render. */
export interface BookImage {
  src: `/${string}`;
  alt: string;
  width: number;
  height: number;
}

export type TapeStyle = "corners" | "top" | "none";

export type Block =
  | { kind: "kicker"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "body"; paragraphs: readonly string[] }
  | { kind: "note"; text: string; align?: "start" | "end" }
  | { kind: "list"; items: readonly string[]; ordered?: boolean }
  | { kind: "image"; image: BookImage; caption?: string; tape?: TapeStyle; tilt?: number }
  | { kind: "screens"; images: readonly BookImage[]; caption?: string }
  | { kind: "callout"; label: string; text: string; links?: readonly BookLink[] };

export interface BookLink {
  label: string;
  href: string;
}

export interface BookPage {
  id: string;
  blocks: readonly Block[];
}

export interface BookSpread {
  id: string;
  /** Short name used in announcements, e.g. "Spread 2 of 9: Who's ordering". */
  title: string;
  /** One line shown under the book while this spread is open. */
  caption: string;
  left: BookPage;
  right: BookPage;
}

export interface ProjectBook {
  slug: string;
  title: string;
  spreads: readonly BookSpread[];
}

/** A page with its position in the book, as produced by `flattenPages`. */
export interface FlatPage {
  index: number;
  spreadIndex: number;
  side: PageSide;
  page: BookPage;
  spread: BookSpread;
}
