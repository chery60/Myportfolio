import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { getProjectBook, projectBookSlugs } from "./index";

describe("getProjectBook", () => {
  test("finds a book by its case-study slug", () => {
    expect(getProjectBook("symphony-kiosk")?.slug).toBe("symphony-kiosk");
  });

  test("returns undefined for case studies without a book", () => {
    expect(getProjectBook("companies-platform")).toBeUndefined();
    expect(getProjectBook("")).toBeUndefined();
  });

  test("never resolves object prototype keys", () => {
    expect(getProjectBook("constructor")).toBeUndefined();
    expect(getProjectBook("__proto__")).toBeUndefined();
    expect(getProjectBook("toString")).toBeUndefined();
  });
});

describe("projectBookSlugs", () => {
  test("every book belongs to an existing case study", () => {
    for (const slug of projectBookSlugs()) {
      expect(existsSync(path.join(process.cwd(), "content", `${slug}.mdx`)), slug).toBe(true);
    }
  });
});
