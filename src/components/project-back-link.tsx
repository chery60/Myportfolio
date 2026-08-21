"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const buttonClassName =
  "text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2 py-1 inline-flex items-center gap-1 mb-6 group";

function getBackHref(from: string | null, page: string | null) {
  if (from === "home") {
    return "/#projects";
  }

  if (from === "projects" && page && page !== "1" && /^\d+$/.test(page)) {
    return `/blog?page=${page}`;
  }

  return "/blog";
}

export function ProjectBackLinkFallback() {
  return (
    <Link
      href="/blog"
      className={buttonClassName}
      aria-label="Back to Projects"
    >
      <ChevronLeft className="size-3 group-hover:-translate-x-px transition-transform" />
      Back to Projects
    </Link>
  );
}

export function ProjectBackLink() {
  const searchParams = useSearchParams();
  const backHref = getBackHref(
    searchParams.get("from"),
    searchParams.get("page")
  );

  return (
    <Link
      href={backHref}
      className={buttonClassName}
      aria-label="Back to Projects"
    >
      <ChevronLeft className="size-3 group-hover:-translate-x-px transition-transform" />
      Back to Projects
    </Link>
  );
}
