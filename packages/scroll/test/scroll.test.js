import { beforeAll, describe, expect, it, vi } from "vitest";
import scrollPlugin from "../src/index.js";
import { startAlpine } from "../../../test/helpers.js";

describe("@airluracode/alpine-scroll", () => {
  let store;

  beforeAll(() => {
    vi.stubGlobal("scrollTo", vi.fn());
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1600,
    });

    const Alpine = startAlpine(scrollPlugin);
    store = Alpine.store("scroll");
  });

  it("tracks scroll progress", () => {
    store.refresh();
    expect(store.y).toBe(120);
    expect(store.progress).toBeGreaterThan(0);
    expect(store.isAtTop).toBe(false);
  });

  it("locks and unlocks the body with reference counting", () => {
    store.lock();
    expect(store.isLocked).toBe(true);
    expect(document.body.classList.contains("scroll-locked")).toBe(true);

    store.lock();
    store.unlock();
    expect(store.isLocked).toBe(true);

    store.unlock();
    expect(store.isLocked).toBe(false);
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  it("exposes showToTop when scrolled and unlocked", () => {
    store.refresh();
    expect(store.showToTop).toBe(true);

    store.lock();
    expect(store.showToTop).toBe(false);
    store.unlock();
  });
});
