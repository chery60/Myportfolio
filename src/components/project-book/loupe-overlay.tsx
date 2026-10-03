import { Rise } from "cube-motion/react";
import type { BookLayout, FlatPage } from "@/lib/book/types";
import styles from "./loupe.module.css";
import { StaticPages } from "./static-pages";
import type { GlassHandlers, LoupeRefs } from "./use-loupe";

interface LoupeOverlayProps extends LoupeRefs {
  open: boolean;
  glassHandlers: GlassHandlers;
  pages: readonly FlatPage[];
  /** The pages currently open; the lens shows a magnified copy of them. */
  indices: readonly number[];
  layout: BookLayout;
  hintId: string;
}

/**
 * The glass and what it shows. The lens is a second, decorative render of the
 * open pages, scaled about the glass centre and masked to a circle, so text
 * stays sharp at any magnification. It rises in and leaves with cube-motion.
 */
export function LoupeOverlay({
  open,
  layerRef,
  contentRef,
  glassRef,
  glassHandlers,
  pages,
  indices,
  layout,
  hintId,
}: LoupeOverlayProps) {
  return (
    <Rise show={open} className={styles.root} data-loupe="">
      <div ref={layerRef} className={styles.lens} data-lens="" aria-hidden="true" inert>
        <div ref={contentRef} className={styles.content} data-lens-content="">
          <StaticPages pages={pages} indices={indices} layout={layout} decorative />
        </div>
      </div>
      <div
        ref={glassRef}
        className={styles.glass}
        data-glass=""
        tabIndex={0}
        role="group"
        aria-roledescription="magnifier"
        aria-label="Magnifier"
        aria-describedby={hintId}
        {...glassHandlers}
      />
    </Rise>
  );
}
