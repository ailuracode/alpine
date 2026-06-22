import { beforeAll, describe, expect, it, vi } from "vitest";
import themePlugin from "../src/index.js";
import { startAlpine } from "../../../test/helpers.js";

describe("@ailuracode/alpine-theme", () => {
  const onChange = vi.fn();
  let store;

  beforeAll(() => {
    localStorage.setItem("test-theme", "light");
    const Alpine = startAlpine(
      themePlugin({ onChange, storageKey: "test-theme" })
    );
    store = Alpine.store("theme");
  });

  it("bootstraps from localStorage and notifies onChange", () => {
    expect(store.mode).toBe("light");
    expect(store.resolved).toBe("light");
    expect(store.isLight).toBe(true);
    expect(onChange).toHaveBeenCalledWith({
      mode: "light",
      resolved: "light",
    });
  });

  it("updates mode, persistence and onChange via set()", () => {
    onChange.mockClear();
    store.set("dark");

    expect(store.mode).toBe("dark");
    expect(store.isDark).toBe(true);
    expect(localStorage.getItem("test-theme")).toBe("dark");
    expect(onChange).toHaveBeenCalledWith({
      mode: "dark",
      resolved: "dark",
    });
  });

  it("cycles through modes", () => {
    store.set("light");
    store.cycle();
    expect(store.mode).toBe("dark");

    store.cycle();
    expect(store.mode).toBe("system");
  });

  it("exposes resolved getters", () => {
    store.set("dark");
    expect(store.isResolvedDark).toBe(true);
    expect(store.isResolved("dark")).toBe(true);
  });
});
