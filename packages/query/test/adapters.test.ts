import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient, vanillaQueryAdapter } from "../src/index.js";

describe("vanillaQueryAdapter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("powers createQueryClient() without external store libraries", async () => {
    const client = createQueryClient({ adapter: vanillaQueryAdapter });
    const queryFn = vi.fn().mockResolvedValue("ok");
    const query = client.observe(["adapter"], queryFn);

    await vi.runAllTimersAsync();

    expect(query.isSuccess).toBe(true);
    expect(query.data).toBe("ok");
    query.destroy();
    client.reset();
  });
});
