"use client";

import { cn, withBasePath } from "@/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";

interface Props {
  /** YouTube video id, e.g. "dQw4w9WgXcQ" */
  videoId: string;
  title: string;
  /** Local poster path. Keeps the pre-click page free of any YouTube request. */
  poster?: string;
  /** Shown beside the label, e.g. "3:36" */
  duration?: string;
  label?: string;
  className?: string;
}

/**
 * A click-to-load YouTube facade.
 *
 * Nothing from YouTube is requested until the viewer presses play — no iframe,
 * no player script, no cookies, and no thumbnail fetch either, because the
 * poster is served locally. That means this can sit directly under the inline
 * explainer without adding a second video's worth of page weight.
 */
export function YouTubeEmbed({
  videoId,
  title,
  poster,
  duration,
  label = "Full walkthrough",
  className,
}: Props) {
  const [active, setActive] = useState(false);

  return (
    <figure className={cn("not-prose my-8", className)}>
      <figcaption className="mb-3 flex items-baseline gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {duration && (
          <span className="font-mono text-xs text-muted-foreground">{duration}</span>
        )}
      </figcaption>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
        {active ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            // nocookie host, and autoplay only because this is a user gesture.
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {poster && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={withBasePath(poster)}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/80 text-white transition-transform duration-200 group-hover:scale-110">
                <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>
    </figure>
  );
}
