import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startAlpine } from "../../../test/helpers.js";
import tooltipPlugin, { computeTooltipPosition, createTooltipStore } from "../src/index.js";

describe("@ailuracode/alpine-tooltip", () => {
  let store: ReturnType<typeof createTooltipStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = createTooltipStore();
    store.register("help", { openDelay: 100, closeDelay: 50 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens and closes with delays", () => {
    store.open("help");
    expect(store.isOpen("help")).toBe(false);

    vi.advanceTimersByTime(100);
    expect(store.isOpen("help")).toBe(true);

    store.close("help");
    vi.advanceTimersByTime(50);
    expect(store.isOpen("help")).toBe(false);
  });

  it("computes basic positions", () => {
    const anchor = new DOMRect(100, 100, 40, 20);
    const floating = new DOMRect(0, 0, 80, 24);

    expect(computeTooltipPosition(anchor, floating, "bottom", 8)).toEqual({
      x: 80,
      y: 128,
      placement: "bottom",
    });
  });

  it("dismisses on Escape", () => {
    store.register("help", { openDelay: 0 });
    store.open("help");

    store.handleKeydown("help", new KeyboardEvent("keydown", { key: "Escape" }));
    expect(store.isOpen("help")).toBe(false);
  });

  it("positions top placement above the anchor height", () => {
    const anchor = new DOMRect(100, 200, 40, 32);
    const floating = new DOMRect(0, 0, 80, 24);

    const position = computeTooltipPosition(anchor, floating, "top", 8);
    expect(position.y + floating.height).toBeLessThanOrEqual(anchor.top - 8 + 0.001);
  });

  it("updates position after bindElements and open", async () => {
    vi.useRealTimers();
    store.register("help", { placement: "bottom", openDelay: 0 });

    const anchor = document.createElement("button");
    anchor.getBoundingClientRect = () => new DOMRect(100, 100, 40, 20);
    const floating = document.createElement("div");
    floating.getBoundingClientRect = () => new DOMRect(0, 0, 80, 24);
    document.body.append(anchor, floating);

    store.bindElements("help", anchor, floating);
    store.open("help");

    await Promise.resolve();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(store.getPosition("help")).toEqual({ x: 80, y: 128, placement: "bottom" });
    expect(store.tooltipStyle("help")).toEqual({
      position: "fixed",
      left: "80px",
      top: "128px",
    });

    anchor.remove();
    floating.remove();
    vi.useFakeTimers();
  });

  it("registers with Alpine store", () => {
    const Alpine = startAlpine(tooltipPlugin());
    const tooltip = Alpine.store("tooltip") as ReturnType<typeof createTooltipStore>;

    tooltip.register("demo");
    tooltip.open("demo");
    expect(tooltip.isOpen("demo")).toBe(true);
  });
});
