/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { cn, withBasePath } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return <div className="w-full h-48 bg-muted" />;
  }

  return (
    <img
      src={withBasePath(src)}
      alt={alt}
      className="w-full h-48 object-cover"
      onError={() => setImageError(true)}
    />
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// Reels play on hover only, so a device without a real pointer never plays one.
// This also stops a stray touch during a scroll from starting a video.
const HOVER_QUERY = "(hover: hover)";

function prefersLessData() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (!connection) {
    return false;
  }

  return (
    connection.saveData === true ||
    /^(slow-)?2g$/.test(connection.effectiveType ?? "")
  );
}

/**
 * The card's thumbnail, with the reel layered over it and revealed only while
 * the card is hovered or keyboard-focused.
 *
 * The still is always in the DOM underneath, so "not playing" is a real image
 * rather than a paused video frame — which matters here because every reel
 * opens and closes on blank white to make its loop seamless. Pausing and
 * resetting a video would show that white frame; the still never does.
 */
function ProjectReel({
  src,
  poster,
  alt,
  active,
}: {
  src: string;
  poster?: string;
  alt: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  // Reduced motion, a metered connection, or a device with no hover: still only.
  const [blocked, setBlocked] = useState(false);
  // Only fade the reel in once it is genuinely playing, so the blank first
  // frame never flashes over the thumbnail.
  const [showing, setShowing] = useState(false);

  // Environment is read after mount so the first client render still matches
  // the server's markup.
  useEffect(() => {
    const motion = window.matchMedia(REDUCED_MOTION_QUERY);
    const hover = window.matchMedia(HOVER_QUERY);
    const update = () =>
      setBlocked(motion.matches || !hover.matches || prefersLessData());

    update();
    motion.addEventListener("change", update);
    hover.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      hover.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || failed || blocked) {
      return;
    }

    if (active) {
      // Nothing is fetched until the first hover.
      if (el.preload !== "auto") {
        el.preload = "auto";
      }
      // React can drop the `muted` attribute from server-rendered markup, and
      // iOS refuses to start an unmuted video from script.
      el.muted = true;
      el.play().catch((error: DOMException) => {
        // AbortError = the pointer left mid-load. NotAllowedError = autoplay
        // policy. Neither means the file is broken.
        if (error?.name !== "AbortError" && error?.name !== "NotAllowedError") {
          setFailed(true);
        }
      });
      return;
    }

    // `onPause` clears `showing` — driving it from the element's own event keeps
    // this effect free of state updates.
    el.pause();
    el.currentTime = 0;
  }, [active, failed, blocked]);

  const showReel = Boolean(src) && !failed && !blocked;

  return (
    <>
      <ProjectImage src={poster ?? ""} alt={alt} />
      {showReel && (
        <video
          ref={ref}
          src={withBasePath(src)}
          loop
          muted
          playsInline
          preload="none"
          disableRemotePlayback
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-48 object-cover transition-opacity duration-200",
            showing ? "opacity-100" : "opacity-0"
          )}
          onPlaying={() => setShowing(true)}
          onPause={() => setShowing(false)}
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  links,
  className,
}: Props) {
  const projectHref = href || "#";
  const isExternalProject = /^https?:\/\//.test(projectHref);
  // Hovering anywhere on the card plays its reel — not just the media box.
  // Focus is wired up too, so the reel is reachable by keyboard.
  const [active, setActive] = useState(false);

  return (
    <Link
      href={projectHref}
      target={isExternalProject ? "_blank" : undefined}
      rel={isExternalProject ? "noopener noreferrer" : undefined}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "group flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 cursor-pointer hover:ring-muted transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={`Open ${title}`}
    >
      <div className="relative shrink-0">
        {video ? (
          <ProjectReel src={video} poster={image} alt={title} active={active} />
        ) : image ? (
          <ProjectImage src={image} alt={title} />
        ) : (
          <div className="w-full h-48 bg-muted" />
        )}
        {links && links.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-2">
            {links.map((link, idx) => (
              <Badge
                key={idx}
                className="flex items-center gap-1.5 text-xs bg-black text-white group-hover:bg-black/90"
                variant="default"
              >
                {link.icon}
                {link.type}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{title}</h3>
            <time className="text-xs text-muted-foreground">{dates}</time>
          </div>
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <div className="text-xs flex-1 prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
          <Markdown>{description}</Markdown>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="text-[11px] font-medium border border-border h-6 w-fit px-2"
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
