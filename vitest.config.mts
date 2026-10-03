import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Tests live next to the source in `src/`. The repo root also holds the
// committed GitHub Pages export (`_next/`, `blog/`, …), so the include list
// is deliberately narrow.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    modules: {
      // Stable, readable class names so tests can assert on them.
      generateScopedName: "[local]",
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      include: [
        "src/lib/book/**",
        "src/data/books/**",
        "src/components/project-book/**",
        "src/components/use-media-query.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.module.css",
        "src/components/project-book/book-fonts.ts",
        "src/components/project-book/project-book-section.tsx",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
