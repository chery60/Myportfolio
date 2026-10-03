"use client";

import { Morph, Rise } from "cube-motion/react";
import { Search, X } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, useCallback, useId, useMemo, useReducer, useRef } from "react";
import { REDUCED_MOTION_QUERY, useMediaQuery } from "@/components/use-media-query";
import { keyToBookCommand } from "@/lib/book/keys";
import {
  flattenPages,
  lastViewPage,
  neighbourImageSrcs,
  positionLabel,
  spreadIndexOf,
  visiblePageIndices,
} from "@/lib/book/pages";
import { bookReducer, canStep, createBookState, sceneFor } from "@/lib/book/turn-machine";
import type { BookLayout, ProjectBook as ProjectBookData } from "@/lib/book/types";
import { cn } from "@/lib/utils";
import { BookControls, CONTROL_BUTTON } from "./book-controls";
import { BookStage } from "./book-stage";
import { LoupeOverlay } from "./loupe-overlay";
import styles from "./project-book.module.css";
import { useBookSize } from "./use-book-size";
import { useCurlFrames } from "./use-curl-frames";
import { useLoupe } from "./use-loupe";
import { usePreloadImages } from "./use-preload-images";
import { usePageTurn } from "./use-page-turn";
import { type TapPoint, useTurnGesture } from "./use-turn-gesture";

interface ProjectBookProps {
  book: ProjectBookData;
}

/**
 * A case study told as a sketchbook. Owns the open page, the layout (two-page
 * spread or one page on narrow screens) and keyboard navigation; the stage,
 * controls and loupe are presentational.
 */
export function ProjectBook({ book }: ProjectBookProps) {
  const pages = useMemo(() => flattenPages(book), [book]);
  const [state, dispatch] = useReducer(bookReducer, pages.length, (total) => createBookState(total));
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hintId = useId();
  const glassHintId = useId();

  const onLayout = useCallback((layout: BookLayout) => dispatch({ type: "set-layout", layout }), []);
  useBookSize(frameRef, stageRef, onLayout);
  usePreloadImages(neighbourImageSrcs(book, state.page, state.layout));

  const turn = usePageTurn(state, dispatch, reducedMotion);
  const { step } = turn;
  useCurlFrames(turn.progress, stageRef, state.turn ? String(state.turn.id) : null);

  const scene = sceneFor(state);
  const loupe = useLoupe({
    stageRef,
    toggleRef,
    layerRef,
    contentRef,
    glassRef,
    reducedMotion,
    turning: scene.kind === "turn",
  });

  // With the glass out, a tap aims it; otherwise a tap turns toward the side pressed.
  const handleTap = ({ side, x, y }: TapPoint) =>
    loupe.open ? loupe.placeAt({ x, y }) : step(side === "right" ? "next" : "prev");
  const gesture = useTurnGesture({ layout: state.layout, turn, reducedMotion, onTap: handleTap });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const command = keyToBookCommand(event);
    if (!command) {
      return;
    }
    event.preventDefault();
    // Focus on a link inside a page that is about to turn away would fall to
    // <body> when that page unmounts; keep it on the book instead.
    if (event.target instanceof Element && event.target.closest("[data-page]")) {
      stageRef.current?.focus();
    }
    if (command === "prev" || command === "next") {
      step(command);
      return;
    }
    if (!state.turn) {
      dispatch({ type: "jump", page: command === "first" ? 0 : lastViewPage(state.layout, state.total) });
    }
  };

  const spreadIndex = spreadIndexOf(state.page);
  const caption = book.spreads[spreadIndex]?.caption ?? "";
  const counter =
    state.layout === "spread"
      ? `Spread ${spreadIndex + 1} / ${book.spreads.length}`
      : `Page ${state.page + 1} / ${state.total}`;

  return (
    <section className={styles.book} aria-roledescription="book" aria-labelledby={titleId} onKeyDown={handleKeyDown}>
      <h2 id={titleId} className="sr-only">
        {`${book.title}: project notebook`}
      </h2>
      <div ref={frameRef} className={styles.frame} data-book-frame>
        <div className={styles.desk}>
          <BookStage
            stageRef={stageRef}
            pages={pages}
            scene={scene}
            layout={state.layout}
            hintId={hintId}
            gesture={gesture}
          >
            <LoupeOverlay
              open={loupe.open}
              layerRef={layerRef}
              contentRef={contentRef}
              glassRef={glassRef}
              glassHandlers={loupe.glassHandlers}
              pages={pages}
              indices={visiblePageIndices(state.page, state.layout)}
              layout={state.layout}
              hintId={glassHintId}
            />
          </BookStage>
          <p id={hintId} className="sr-only">
            Use the left and right arrow keys to turn pages. Home and End jump to the first and last spread.
          </p>
          <p id={glassHintId} className="sr-only">
            Drag the magnifier or move it with the arrow keys; hold Shift to move faster. Escape puts it away.
          </p>
          <div className={styles.toolbar}>
            <BookControls
              counter={counter}
              canPrev={canStep(state, "prev")}
              canNext={canStep(state, "next")}
              onPrev={() => step("prev")}
              onNext={() => step("next")}
            >
              <button
                ref={toggleRef}
                type="button"
                className={cn(CONTROL_BUTTON, "gap-2 text-sm min-[400px]:w-auto min-[400px]:px-4")}
                aria-pressed={loupe.open}
                onClick={(event: MouseEvent<HTMLButtonElement>) => loupe.toggle(event.detail === 0)}
              >
                <Morph
                  active={loupe.open}
                  off={<Search className="size-4" aria-hidden="true" />}
                  on={<X className="size-4" aria-hidden="true" />}
                />
                {/* Icon-only on very narrow screens; the name stays for screen readers. */}
                <span className="max-[399px]:sr-only">Magnifier</span>
              </button>
            </BookControls>
            {state.navCount === 0 ? (
              <p className={styles.caption}>{caption}</p>
            ) : (
              <Rise key={spreadIndex} as="p" className={styles.caption}>
                {caption}
              </Rise>
            )}
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {state.navCount > 0 ? positionLabel(book, state.page, state.layout) : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
