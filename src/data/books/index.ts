import type { ProjectBook } from "@/lib/book/types";
import { symphonyKiosk } from "./symphony-kiosk";

/** Books by case-study slug. A Map, so prototype keys like "constructor" never resolve. */
const BOOKS = new Map<string, ProjectBook>([[symphonyKiosk.slug, symphonyKiosk]]);

export function getProjectBook(slug: string): ProjectBook | undefined {
  return BOOKS.get(slug);
}

export function projectBookSlugs(): readonly string[] {
  return [...BOOKS.keys()];
}
