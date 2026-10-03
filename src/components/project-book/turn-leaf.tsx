import { type CSSProperties, type ReactNode, memo } from "react";
import { STRIP_COUNT } from "@/lib/book/curl-geometry";
import type { BookLayout, FlatPage } from "@/lib/book/types";
import { cn } from "@/lib/utils";
import { BlankPage, BookPageView } from "./book-page";
import styles from "./curl.module.css";

interface TurnLeafProps {
  pages: readonly FlatPage[];
  /** Page on the leaf's front (visible before it turns). */
  front: number;
  /** Page on the leaf's back, or null for blank paper (single-page layout). */
  back: number | null;
  layout: BookLayout;
}

interface FaceProps {
  side: "front" | "back";
  /** Which vertical slice of the page this strip shows. */
  slice: number;
  content: ReactNode;
}

function Face({ side, slice, content }: FaceProps) {
  return (
    <div
      className={cn(styles.face, side === "back" && styles.back)}
      data-face={side}
      style={{ "--slice": slice } as CSSProperties}
    >
      <div className={styles.slice}>{content}</div>
      <div className={styles.shade} data-shade={side} />
      <div className={styles.glow} data-glow={side} />
    </div>
  );
}

/**
 * The page in flight: STRIP_COUNT strips, each nested in the one before, each
 * showing its slice of the front page and, mirrored, of the back page.
 * Transforms and lighting are written per frame by useCurlFrames. Memoised so
 * the book's own re-renders (turn start, release, loupe toggle) skip all 16 faces.
 */
export const TurnLeaf = memo(function TurnLeaf({ pages, front, back, layout }: TurnLeafProps) {
  const total = pages.length;
  const frontPage = <BookPageView flat={pages[front]} total={total} spine="left" decorative />;
  const backPage =
    back === null ? <BlankPage spine="right" /> : <BookPageView flat={pages[back]} total={total} spine="right" decorative />;

  return Array.from({ length: STRIP_COUNT }, (_, i) => i).reduceRight<ReactNode>(
    (inner, i) => (
      <div
        className={i === 0 ? styles.leaf : styles.strip}
        data-strip={i}
        {...(i === 0 ? { "data-leaf": "", "data-layout": layout, "aria-hidden": true } : {})}
      >
        <Face side="front" slice={i} content={frontPage} />
        <Face side="back" slice={STRIP_COUNT - 1 - i} content={backPage} />
        {inner}
      </div>
    ),
    null,
  );
});
