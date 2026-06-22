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

  it("falls back to execCommand when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: execCommand,
    });
    const select = vi.spyOn(HTMLTextAreaElement.prototype, "select").mockImplementation(vi.fn());

    const { clipboard } = createMagicHarness(clipboardPlugin);
    await clipboard("fallback");

    expect(execCommand).toHaveBeenCalledWith("copy", false);
    expect(select).toHaveBeenCalled();
    select.mockRestore();
  });
});
