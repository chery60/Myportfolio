import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePreloadImages } from "./use-preload-images";

// jsdom's Image() returns a plain <img>, so record requests at the src setter.
const SRC = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
let requested: string[] = [];

beforeEach(() => {
  requested = [];
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    get(this: HTMLImageElement) {
      return SRC?.get?.call(this);
    },
    set(this: HTMLImageElement, value: string) {
      requested.push(value);
      SRC?.set?.call(this, value);
    },
  });
});

afterEach(() => {
  if (SRC) {
    Object.defineProperty(HTMLImageElement.prototype, "src", SRC);
  }
  vi.unstubAllEnvs();
});

describe("usePreloadImages", () => {
  test("starts loading every image it is given", () => {
    renderHook(() => usePreloadImages(["/preload/a.png", "/preload/b.png"]));

    expect(requested).toEqual(["/preload/a.png", "/preload/b.png"]);
  });

  test("requests each image only once, even across renders and hooks", () => {
    const { rerender } = renderHook(({ srcs }) => usePreloadImages(srcs), {
      initialProps: { srcs: ["/preload/c.png"] as readonly string[] },
    });
    rerender({ srcs: ["/preload/c.png", "/preload/d.png"] });
    renderHook(() => usePreloadImages(["/preload/c.png"]));

    expect(requested).toEqual(["/preload/c.png", "/preload/d.png"]);
  });

  test("loads from the GitHub Pages base path", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Myportfolio");

    renderHook(() => usePreloadImages(["/preload/e.png"]));

    expect(requested).toEqual(["/Myportfolio/preload/e.png"]);
  });
});
