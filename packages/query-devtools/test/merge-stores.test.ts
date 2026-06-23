import { createQueryClient } from "@ailuracode/alpine-query";
import { createAlpineStoreAdapter } from "@ailuracode/alpine-query-adapter-alpine";
import { createAlpineZustandAdapter } from "@ailuracode/alpine-query-adapter-zustand";
import { describe, expect, it, vi } from "vitest";
import { startAlpine } from "../../../test/helpers.js";
import { createMergedQueryDevtools } from "../src/merge-stores.js";

describe("query devtools merge stores", () => {
  it("merges snapshots from multiple query clients", async () => {
    const Alpine = startAlpine();
    const alpineClient = createQueryClient({ adapter: createAlpineStoreAdapter(Alpine) });
    const zustandClient = createQueryClient({ adapter: createAlpineZustandAdapter(Alpine) });
    const merged = createMergedQueryDevtools([alpineClient, zustandClient]);

    const alpineQuery = alpineClient.observe(["alpha"], async () => "a");
    const zustandQuery = zustandClient.observe(["beta"], async () => "b");

    await vi.waitFor(() => {
      expect(alpineQuery.isSuccess).toBe(true);
      expect(zustandQuery.isSuccess).toBe(true);
    });

    const snapshot = merged.getSnapshotView();
    expect(snapshot.adapterName).toBe("Alpine.reactive · Zustand");
    expect(snapshot.queries).toHaveLength(2);
    expect(snapshot.queries.map((entry) => entry.adapterName).sort()).toEqual([
      "Alpine.reactive",
      "Zustand",
    ]);

    const alpineEntry = snapshot.queries.find((entry) => entry.adapterName === "Alpine.reactive");
    if (!alpineEntry) {
      throw new Error("Expected Alpine.reactive query entry");
    }

    merged.getStoreForQuery(alpineEntry).remove(alpineEntry.key);
    expect(alpineClient.get(["alpha"])).toBeUndefined();
    expect(zustandClient.get(["beta"])).toBeDefined();

    alpineQuery.destroy();
    zustandQuery.destroy();
    alpineClient.reset();
    zustandClient.reset();
  });

  it("notifies listeners when any store changes", async () => {
    const Alpine = startAlpine();
    const alpineClient = createQueryClient({ adapter: createAlpineStoreAdapter(Alpine) });
    const zustandClient = createQueryClient({ adapter: createAlpineZustandAdapter(Alpine) });
    const merged = createMergedQueryDevtools([alpineClient, zustandClient]);
    const listener = vi.fn();

    merged.devtools.subscribe(listener);
    const query = zustandClient.observe(["listener"], async () => "ok");

    await vi.waitFor(() => {
      expect(query.isSuccess).toBe(true);
    });

    expect(listener).toHaveBeenCalled();
    query.destroy();
    zustandClient.reset();
    alpineClient.reset();
  });
});
