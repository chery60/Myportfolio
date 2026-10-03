"use client";

import { useCallback, useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to a CSS media query. `serverSnapshot` is what the static
 * prerender (GitHub Pages export) and the first hydrating render see, so the
 * markup matches before the browser's real answer arrives.
 */
export function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => serverSnapshot;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
