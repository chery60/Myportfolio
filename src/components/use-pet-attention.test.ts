import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePetAttention } from "@/components/use-pet-attention";

const FRAME_MS = 16;

function setup(enabled = true) {
  const layer = document.createElement("div");
  document.body.appendChild(layer);
  const ref = { current: layer };
  const view = renderHook(({ on }) => usePetAttention(on, ref), {
    initialProps: { on: enabled },
  });
  return { layer, ...view };
}

function movePointer(x: number, y: number) {
  act(() => {
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType: "mouse" }));
    vi.advanceTimersByTime(FRAME_MS);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("usePetAttention: leaning toward the cursor", () => {
  test("leans toward a cursor that comes close", () => {
    const { layer } = setup();

    movePointer(100, 0);

    expect(layer.style.getPropertyValue("--pet-look-rotate")).toBe("1.92deg");
    expect(layer.style.getPropertyValue("--pet-look-x")).toBe("0.77px");
  });

  test("leans the other way for a cursor on the other side", () => {
    const { layer } = setup();

    movePointer(-130, 20);

    expect(parseFloat(layer.style.getPropertyValue("--pet-look-rotate"))).toBeLessThan(0);
  });

  test("ignores a cursor that is far away", () => {
    const { layer } = setup();

    movePointer(900, 0);

    expect(layer.style.getPropertyValue("--pet-look-rotate")).toBe("0.00deg");
  });

  test("ignores touch, and lets go when disabled", () => {
    const { layer, rerender } = setup();

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 50, clientY: 0, pointerType: "touch" }));
      vi.advanceTimersByTime(FRAME_MS);
    });
    expect(layer.style.getPropertyValue("--pet-look-rotate")).toBe("");

    movePointer(50, 0);
    rerender({ on: false });

    expect(layer.style.getPropertyValue("--pet-look-rotate")).toBe("");
  });
});

describe("usePetAttention: petting", () => {
  test("a lingering hover is a pet: happy for a moment, then back to normal", () => {
    const { result } = setup();

    act(() => result.current.hoverHandlers.onPointerEnter());
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(result.current.petted).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.petted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1_200);
    });
    expect(result.current.petted).toBe(false);
  });

  test("a hover that moves on quickly is not a pet", () => {
    const { result } = setup();

    act(() => result.current.hoverHandlers.onPointerEnter());
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => result.current.hoverHandlers.onPointerLeave());
    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.petted).toBe(false);
  });

  test("does not react to being petted again straight away", () => {
    const { result } = setup();

    act(() => result.current.hoverHandlers.onPointerEnter());
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    act(() => result.current.hoverHandlers.onPointerEnter());
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.petted).toBe(false);
  });

  test("is never petted while disabled", () => {
    const { result } = setup(false);

    act(() => result.current.hoverHandlers.onPointerEnter());
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.petted).toBe(false);
  });
});
