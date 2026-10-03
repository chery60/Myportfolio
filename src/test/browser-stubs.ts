/**
 * Browser APIs jsdom does not implement, stubbed just enough for the project
 * book's components to mount and react. Each stub is controllable from tests
 * through the exported helpers. Loaded once per test file by `vitest.setup.ts`;
 * tests import the helpers from `@/test/browser-stubs`.
 */

// --- matchMedia -------------------------------------------------------------

type MediaListener = (event: MediaQueryListEvent) => void;

const mediaMatches = new Map<string, boolean>();
const mediaListeners = new Map<string, Set<MediaListener>>();

// Reduced motion is on by default so components take their instant path
// unless a test opts into animation.
const DEFAULT_MEDIA: ReadonlyArray<[string, boolean]> = [
  ["(prefers-reduced-motion: reduce)", true],
];

export function resetMedia() {
  mediaMatches.clear();
  mediaListeners.clear();
  for (const [query, matches] of DEFAULT_MEDIA) {
    mediaMatches.set(query, matches);
  }
}
resetMedia();

window.matchMedia = (query: string): MediaQueryList => {
  const listeners = mediaListeners.get(query) ?? new Set<MediaListener>();
  mediaListeners.set(query, listeners);
  return {
    get matches() {
      return mediaMatches.get(query) ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: MediaListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: MediaListener) => listeners.delete(listener),
    addListener: (listener: MediaListener) => listeners.add(listener),
    removeListener: (listener: MediaListener) => listeners.delete(listener),
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;
};

export function setMediaMatches(query: string, matches: boolean) {
  mediaMatches.set(query, matches);
  for (const listener of mediaListeners.get(query) ?? []) {
    listener({ matches, media: query } as MediaQueryListEvent);
  }
}

// --- ResizeObserver ---------------------------------------------------------

type ResizeCallbackRecord = { callback: ResizeObserverCallback; observer: ResizeObserver };
const resizeTargets = new Map<Element, Set<ResizeCallbackRecord>>();

class ResizeObserverStub {
  private readonly record: ResizeCallbackRecord;
  private readonly targets = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this.record = { callback, observer: this as unknown as ResizeObserver };
  }

  observe(target: Element) {
    this.targets.add(target);
    const records = resizeTargets.get(target) ?? new Set<ResizeCallbackRecord>();
    records.add(this.record);
    resizeTargets.set(target, records);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
    resizeTargets.get(target)?.delete(this.record);
  }

  disconnect() {
    for (const target of this.targets) {
      resizeTargets.get(target)?.delete(this.record);
    }
    this.targets.clear();
  }
}
window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

export function triggerResize(target: Element, width: number, height = width / 1.5) {
  const entry = {
    target,
    contentRect: { width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height },
    borderBoxSize: [{ inlineSize: width, blockSize: height }],
    contentBoxSize: [{ inlineSize: width, blockSize: height }],
    devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
  } as unknown as ResizeObserverEntry;
  for (const record of resizeTargets.get(target) ?? []) {
    record.callback([entry], record.observer);
  }
}

// --- IntersectionObserver ---------------------------------------------------

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

// --- Web Animations ---------------------------------------------------------

Element.prototype.animate = function animate() {
  return {
    finished: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    commitStyles() {},
    persist() {},
    addEventListener() {},
    removeEventListener() {},
    playState: "finished",
    currentTime: 0,
    effect: null,
  } as unknown as Animation;
};
Element.prototype.getAnimations = () => [];

// --- Pointer events ---------------------------------------------------------

const windowWithPointer = window as Window & { PointerEvent?: typeof PointerEvent };
if (!windowWithPointer.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  windowWithPointer.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

Element.prototype.setPointerCapture = function setPointerCapture() {};
Element.prototype.releasePointerCapture = function releasePointerCapture() {};
Element.prototype.hasPointerCapture = () => false;

// --- Images -----------------------------------------------------------------

HTMLImageElement.prototype.decode = () => Promise.resolve();
