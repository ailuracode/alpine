import { describe, expect, it } from "vitest";
import { createMagicHarness } from "../../../test/mock-alpine.js";
import { setMatchMedia } from "../../../test/setup.js";
import touchPlugin from "../src/index.js";

describe("@ailuracode/alpine-touch", () => {
  it("registers $touch with pointer capabilities", () => {
    setMatchMedia("(pointer: coarse)", true);
    setMatchMedia("(pointer: fine)", false);
    setMatchMedia("(hover: hover)", false);

    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 2,
    });

    const { touch } = createMagicHarness(touchPlugin);

    expect(touch.isTouch).toBe(true);
    expect(touch.isCoarse).toBe(true);
    expect(touch.canHover).toBe(false);
    expect(touch.maxTouchPoints).toBe(2);
  });
});
