import type { BookLayout, FlatPage } from "@/lib/book/types";
import { BookPageView } from "./book-page";
import styles from "./project-book.module.css";

interface StaticPagesProps {
  pages: readonly FlatPage[];
  indices: readonly number[];
  layout: BookLayout;
  decorative?: boolean;
  /** Hidden and unfocusable while a turn is in flight (the leaf is mid-air). */
  hidden?: boolean;
}

/**
 * Flat pages in their grid slots. Keys are page indices, so a page that stays
 * on screen when a turn starts or ends keeps its DOM (and decoded images).
 */
export function StaticPages({ pages, indices, layout, decorative = false, hidden = false }: StaticPagesProps) {
  return indices.map((index) => {
    const flat = pages[index];
    const side = layout === "single" ? "single" : flat.side;
    return (
      <div key={index} className={styles.slot} data-side={side} aria-hidden={hidden || undefined} inert={hidden || undefined}>
        <BookPageView flat={flat} total={pages.length} spine={side === "left" ? "right" : "left"} decorative={decorative} />
      </div>
    );
  });
}
