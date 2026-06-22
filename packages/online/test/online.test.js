import { describe, expect, it, vi } from "vitest";
import onlinePlugin from "../src/index.js";
import { createMagicHarness } from "../../../test/mock-alpine.js";

describe("@airluracode/alpine-online", () => {
  it("registers $online with isOnline state", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const { online } = createMagicHarness(onlinePlugin);
    expect(online.isOnline).toBe(true);
  });

  it("updates isOnline on offline event", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const { online } = createMagicHarness(onlinePlugin);

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    window.dispatchEvent(new Event("offline"));

    expect(online.isOnline).toBe(false);
  });
});
