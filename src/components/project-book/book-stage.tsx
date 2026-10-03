import type { ReactNode, RefObject } from "react";
import type { TurnScene } from "@/lib/book/turn-machine";
import type { BookLayout, FlatPage } from "@/lib/book/types";
import curl from "./curl.module.css";
import styles from "./project-book.module.css";
import { StaticPages } from "./static-pages";
import { TurnLeaf } from "./turn-leaf";
import type { TurnGestureHandlers } from "./use-turn-gesture";

interface BookStageProps {
  stageRef: RefObject<HTMLDivElement | null>;
  pages: readonly FlatPage[];
  scene: TurnScene;
  layout: BookLayout;
  hintId: string;
  gesture: TurnGestureHandlers;
  /** The loupe sits above the pages. */
  children?: ReactNode;
}

export function BookStage({ stageRef, pages, scene, layout, hintId, gesture, children }: BookStageProps) {
  const turning = scene.kind === "turn";
  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-book-stage
      data-layout={layout}
      data-turning={turning ? "" : undefined}
      tabIndex={0}
      role="group"
      aria-label="Pages"
      aria-describedby={hintId}
      {...gesture}
    >
      <StaticPages pages={pages} indices={turning ? scene.base : scene.pages} layout={layout} hidden={turning} />
      {turning ? (
        <>
          <div className={curl.gutter} data-gutter data-layout={layout} aria-hidden="true" />
          <TurnLeaf key={`${scene.front}-${scene.back}`} pages={pages} front={scene.front} back={scene.back} layout={layout} />
        </>
      ) : null}
      {children}
    </div>
  );
}
