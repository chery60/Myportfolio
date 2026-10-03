import { render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, test, vi } from "vitest";
import type { BookLayout } from "@/lib/book/types";
import { triggerResize } from "@/test/browser-stubs";
import { useBookSize } from "./use-book-size";

function Harness({ onLayout }: { onLayout: (layout: BookLayout) => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useBookSize(frameRef, stageRef, onLayout);
  return (
    <div ref={frameRef} data-testid="frame">
      <div ref={stageRef} data-testid="stage" />
    </div>
  );
}

describe("useBookSize", () => {
  test("reports the layout that fits the frame width", () => {
    const onLayout = vi.fn();
    const { getByTestId } = render(<Harness onLayout={onLayout} />);

    triggerResize(getByTestId("frame"), 390);

    expect(onLayout).toHaveBeenCalledWith("single");
  });

  test("reports again only when the layout changes", () => {
    const onLayout = vi.fn();
    const { getByTestId } = render(<Harness onLayout={onLayout} />);
    const frame = getByTestId("frame");

    triggerResize(frame, 960);
    triggerResize(frame, 1000);
    triggerResize(frame, 390);

    expect(onLayout.mock.calls).toEqual([["spread"], ["single"]]);
  });

  test("publishes the stage size as CSS custom properties", () => {
    const { getByTestId } = render(<Harness onLayout={vi.fn()} />);
    const stage = getByTestId("stage");

    triggerResize(stage, 888, 592);

    expect(stage.style.getPropertyValue("--stage-w")).toBe("888px");
    expect(stage.style.getPropertyValue("--stage-h")).toBe("592px");
  });

  test("stops observing when unmounted", () => {
    const onLayout = vi.fn();
    const { getByTestId, unmount } = render(<Harness onLayout={onLayout} />);
    const frame = getByTestId("frame");

    unmount();
    triggerResize(frame, 390);

    expect(onLayout).not.toHaveBeenCalled();
  });
});
