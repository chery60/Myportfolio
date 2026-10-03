import { memo } from "react";
import type { FlatPage } from "@/lib/book/types";
import { PageBlock } from "./page-blocks";
import styles from "./paper.module.css";

interface BookPageViewProps {
  flat: FlatPage;
  total: number;
  /** Which edge of this page is bound into the spine (shaded). */
  spine: "left" | "right";
  /** True for the copies inside the turning leaf and the loupe. */
  decorative: boolean;
}

/**
 * One sheet of paper. Memoised: the curl renders up to sixteen copies of a
 * page while it turns, and none of them should re-render per frame.
 */
export const BookPageView = memo(function BookPageView({ flat, total, spine, decorative }: BookPageViewProps) {
  const pageNumber = flat.index + 1;
  const a11y = decorative
    ? { "aria-hidden": true, inert: true }
    : { role: "group", "aria-roledescription": "page", "aria-label": `Page ${pageNumber} of ${total}` };

  return (
    <div className={styles.page} data-spine={spine} data-page={flat.index} {...a11y}>
      <div className={styles.inner} data-page-inner>
        {flat.page.blocks.map((block, index) => (
          <PageBlock key={index} block={block} index={index} decorative={decorative} />
        ))}
      </div>
      <span className={styles.folio} aria-hidden="true">
        {pageNumber}
      </span>
    </div>
  );
});

/** A sheet with nothing on it: the back of a leaf in single-page layout. */
export function BlankPage({ spine }: { spine: "left" | "right" }) {
  return <div className={styles.page} data-spine={spine} aria-hidden="true" />;
}
