"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/utils";

/** URLs already requested this session, shared by every book on the page. */
const requested = new Set<string>();

/**
 * Fetches images the reader is one turn away from, so a page revealed by the
 * curl finds them in the HTTP cache instead of waiting on the network.
 * Fire-and-forget: a failed preload is forgotten so a later turn can retry,
 * and the page's own <img> still loads it normally.
 */
export function usePreloadImages(srcs: readonly string[]): void {
  const key = srcs.join("\n");

  useEffect(() => {
    for (const src of key.split("\n")) {
      const url = withBasePath(src);
      if (!url || requested.has(url)) {
        continue;
      }
      requested.add(url);
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      image.decode().catch(() => requested.delete(url));
    }
  }, [key]);
}
