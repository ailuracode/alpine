import { beforeAll, describe, expect, it, vi } from "vitest";
import screenPlugin from "../src/index.js";
import { startAlpine } from "../../../test/helpers.js";
import { setMatchMedia } from "../../../test/setup.js";

describe("@airluracode/alpine-screen", () => {
  let store;

  beforeAll(() => {
    setMatchMedia("(max-width: 767px)", true);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", false);

    const Alpine = startAlpine(screenPlugin);
    store = Alpine.store("device");
  });

  it("registers the device store", () => {
    expect(store).toBeDefined();
    expect(store.mobileMax).toBe(767);
    expect(store.tabletMax).toBe(1023);
  });

  it("detects mobile from matchMedia", () => {
    expect(store.type).toBe("mobile");
    expect(store.isMobile).toBe(true);
    expect(store.is("mobile")).toBe(true);
  });

  it("updates breakpoints", () => {
    store.setBreakpoints({ mobileMax: 500, tabletMax: 900 });
    expect(store.mobileMax).toBe(500);
    expect(store.tabletMax).toBe(900);
  });
});
