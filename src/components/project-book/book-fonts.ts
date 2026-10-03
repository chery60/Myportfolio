import { Caveat, Instrument_Serif, Newsreader } from "next/font/google";

// Loaded only on pages that render a book. Exposed as CSS variables read by
// paper.module.css and project-book.module.css.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-book-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-book-body",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-book-hand",
  display: "swap",
});

export const bookFontVariables = `${display.variable} ${body.variable} ${hand.variable}`;
