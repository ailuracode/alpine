import { describe, expect, it, vi } from "vitest";
import { createMagicHarness } from "../../../test/mock-alpine.js";
import clipboardPlugin from "../src/index.js";

describe("@ailuracode/alpine-clipboard", () => {
  it("copies text via navigator.clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { clipboard } = createMagicHarness(clipboardPlugin);
    await clipboard("hola");

    expect(writeText).toHaveBeenCalledWith("hola");
  });

  it("coerces values to string", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { clipboard } = createMagicHarness(clipboardPlugin);
    await clipboard(42);

    expect(writeText).toHaveBeenCalledWith("42");
  });
});
