import { describe, expect, test } from "vitest";
import { type KeyInput, keyToBookCommand, keyToGlassCommand } from "./keys";

function key(name: string, modifiers: Partial<KeyInput> = {}): KeyInput {
  return { key: name, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...modifiers };
}

describe("keyToBookCommand", () => {
  test("turns pages with the arrow and page keys", () => {
    expect(keyToBookCommand(key("ArrowLeft"))).toBe("prev");
    expect(keyToBookCommand(key("ArrowRight"))).toBe("next");
    expect(keyToBookCommand(key("PageUp"))).toBe("prev");
    expect(keyToBookCommand(key("PageDown"))).toBe("next");
  });

  test("jumps to the ends with Home and End", () => {
    expect(keyToBookCommand(key("Home"))).toBe("first");
    expect(keyToBookCommand(key("End"))).toBe("last");
  });

  test("leaves browser and system shortcuts alone", () => {
    expect(keyToBookCommand(key("ArrowLeft", { altKey: true }))).toBeNull();
    expect(keyToBookCommand(key("ArrowRight", { metaKey: true }))).toBeNull();
    expect(keyToBookCommand(key("Home", { ctrlKey: true }))).toBeNull();
  });

  test("ignores keys it does not handle, including Escape", () => {
    expect(keyToBookCommand(key("Escape"))).toBeNull();
    expect(keyToBookCommand(key("a"))).toBeNull();
  });
});

describe("keyToGlassCommand", () => {
  test("moves the glass with the arrow keys, faster with Shift", () => {
    expect(keyToGlassCommand(key("ArrowUp"))).toEqual({ kind: "move", move: "up", fast: false });
    expect(keyToGlassCommand(key("ArrowDown"))).toEqual({ kind: "move", move: "down", fast: false });
    expect(keyToGlassCommand(key("ArrowLeft"))).toEqual({ kind: "move", move: "left", fast: false });
    expect(keyToGlassCommand(key("ArrowRight", { shiftKey: true }))).toEqual({ kind: "move", move: "right", fast: true });
  });

  test("parks the glass with Home and closes it with Escape", () => {
    expect(keyToGlassCommand(key("Home"))).toEqual({ kind: "park" });
    expect(keyToGlassCommand(key("Escape"))).toEqual({ kind: "close" });
  });

  test("leaves shortcuts and unrelated keys alone", () => {
    expect(keyToGlassCommand(key("ArrowUp", { metaKey: true }))).toBeNull();
    expect(keyToGlassCommand(key("Enter"))).toBeNull();
  });
});
