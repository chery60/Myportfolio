import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BookControlsProps {
  counter: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Extra tools, e.g. the magnifier toggle. */
  children?: ReactNode;
}

export const CONTROL_BUTTON = cn(
  "inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground",
  "transition-[scale,background-color,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
  "hover:bg-muted active:scale-[0.97] active:duration-100",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-background/80 aria-disabled:active:scale-100",
);

/**
 * Prev / position / next. Ends use `aria-disabled` rather than `disabled` so
 * a keyboard user's focus stays on the button instead of falling to <body>.
 */
export function BookControls({ counter, canPrev, canNext, onPrev, onNext, children }: BookControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        className={CONTROL_BUTTON}
        aria-label="Previous page"
        aria-disabled={!canPrev}
        onClick={() => canPrev && onPrev()}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <span className="min-w-[6.5rem] text-center font-mono text-xs tracking-wide text-muted-foreground tabular-nums">
        {counter}
      </span>
      <button
        type="button"
        className={CONTROL_BUTTON}
        aria-label="Next page"
        aria-disabled={!canNext}
        onClick={() => canNext && onNext()}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
