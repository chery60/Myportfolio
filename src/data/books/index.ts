import type { ProjectBook } from "@/lib/book/types";
import { aiUnitPlanning } from "./ai-unit-planning";
import { companiesPlatform } from "./companies-platform";
import { educatorPlatform } from "./educator-platform";
import { symphonyKiosk } from "./symphony-kiosk";
import { userManagement } from "./user-management";

/** Books by case-study slug. A Map, so prototype keys like "constructor" never resolve. */
const BOOKS = new Map<string, ProjectBook>(
  [aiUnitPlanning, symphonyKiosk, companiesPlatform, userManagement, educatorPlatform].map((book) => [book.slug, book]),
);

export function getProjectBook(slug: string): ProjectBook | undefined {
  return BOOKS.get(slug);
}

export function projectBookSlugs(): readonly string[] {
  return [...BOOKS.keys()];
}
