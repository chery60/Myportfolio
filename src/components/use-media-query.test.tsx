import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { setMediaMatches } from "@/test/browser-stubs";
import { REDUCED_MOTION_QUERY, useMediaQuery } from "./use-media-query";

const NARROW = "(max-width: 600px)";

describe("useMediaQuery", () => {
  test("reports whether the query currently matches", () => {
    setMediaMatches(NARROW, true);

    const { result } = renderHook(() => useMediaQuery(NARROW));

    expect(result.current).toBe(true);
  });

  test("updates when the media query starts or stops matching", () => {
    const { result } = renderHook(() => useMediaQuery(NARROW));
    expect(result.current).toBe(false);

    act(() => setMediaMatches(NARROW, true));
    expect(result.current).toBe(true);

    act(() => setMediaMatches(NARROW, false));
    expect(result.current).toBe(false);
  });

  test("uses the server snapshot while prerendering", () => {
    function Probe() {
      return <span>{String(useMediaQuery(REDUCED_MOTION_QUERY, false))}</span>;
    }

    expect(renderToString(<Probe />)).toContain("false");
  });
});
