import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { resetMedia } from "./src/test/browser-stubs";

afterEach(() => {
  cleanup();
  resetMedia();
});
