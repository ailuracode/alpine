import { beforeEach, describe, expect, it } from "vitest";
import { startAlpine } from "../../../test/helpers.js";
import tabsPlugin, { createTabsStore } from "../src/index.js";

describe("@ailuracode/alpine-tabs", () => {
  let store: ReturnType<typeof createTabsStore>;

  beforeEach(() => {
    store = createTabsStore();
    store.register("settings-tabs", { defaultTab: "profile" });
    store.registerTab("settings-tabs", "profile");
    store.registerTab("settings-tabs", "billing");
    store.registerTab("settings-tabs", "security");
  });

  it("selects and tracks active tab", () => {
    expect(store.active("settings-tabs")).toBe("profile");
    expect(store.isActive("settings-tabs", "profile")).toBe(true);

    store.select("settings-tabs", "billing");
    expect(store.isActive("settings-tabs", "billing")).toBe(true);
  });

  it("moves to next and previous tabs", () => {
    store.select("settings-tabs", "profile");
    store.next("settings-tabs");
    expect(store.active("settings-tabs")).toBe("billing");

    store.previous("settings-tabs");
    expect(store.active("settings-tabs")).toBe("profile");
  });

  it("handles keyboard navigation", () => {
    store.select("settings-tabs", "profile");

    store.handleKeydown("settings-tabs", new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(store.active("settings-tabs")).toBe("billing");
  });

  it("exposes ARIA tab props", () => {
    store.select("settings-tabs", "profile");

    expect(store.tabProps("settings-tabs", "profile")).toMatchObject({
      role: "tab",
      "aria-selected": true,
      tabindex: 0,
    });

    expect(store.panelProps("settings-tabs", "billing").hidden).toBe(true);
  });

  it("syncs with URL query param when configured", () => {
    window.history.replaceState({}, "", "/?tab=billing");
    store.register("url-tabs", { urlParam: "tab" });
    store.registerTab("url-tabs", "profile");
    store.registerTab("url-tabs", "billing");

    expect(store.active("url-tabs")).toBe("billing");

    store.select("url-tabs", "profile");
    expect(new URL(window.location.href).searchParams.get("tab")).toBe("profile");
  });

  it("registers with Alpine store", () => {
    const Alpine = startAlpine(tabsPlugin());
    const tabs = Alpine.store("tabs") as ReturnType<typeof createTabsStore>;

    tabs.register("demo");
    tabs.registerTab("demo", "one");
    expect(tabs.active("demo")).toBe("one");
  });
});
