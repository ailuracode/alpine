import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { z } from "zod";
import { startAlpine } from "../../../test/helpers.js";
import createUrlPlugin, { createSchemaHandler, type UrlStoreOf } from "../src/index.js";

const FILTER_SCHEMA = z.object({
  page: z.coerce.number().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional(),
  tab: z.enum(["overview", "settings", "billing"]).optional(),
});

describe("@ailuracode/alpine-url runtime", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("bootstraps query params from the URL", () => {
    window.history.replaceState(
      null,
      "",
      "/?page=2&search=hello&active=true&tags=a&tags=b&tab=settings"
    );

    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;

    expect(store.query.page).toBe(2);
    expect(store.query.search).toBe("hello");
    expect(store.query.active).toBe(true);
    expect(store.query.tags).toEqual(["a", "b"]);
    expect(store.query.tab).toBe("settings");
  });

  it("rejects invalid values at runtime", () => {
    window.history.replaceState(null, "", "/?page=abc&tab=other");
    const handler = createSchemaHandler(FILTER_SCHEMA);
    const query = handler.parse(new URLSearchParams(window.location.search));

    expect(query.page).toBeUndefined();
    expect(query.tab).toBeUndefined();
  });

  it("updates the URL on set()", () => {
    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;

    store.set("page", 3);
    store.set("tab", "billing");

    expect(window.location.search).toBe("?page=3&tab=billing");
    expect(store.search).toBe("?page=3&tab=billing");
  });

  it("uses pushState when pushOnSet is enabled", () => {
    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA, pushOnSet: true }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;
    const pushState = vi.spyOn(window.history, "pushState");

    store.set("page", 2);

    expect(pushState).toHaveBeenCalled();
  });

  it("ignores set() when validation fails", () => {
    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;

    store.set("tab", "other" as "overview");
    expect(store.get("tab")).toBeUndefined();
    expect(window.location.search).toBe("");
  });

  it("sync() re-reads from window.location", () => {
    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;

    window.history.replaceState(null, "", "/?page=5");
    store.sync();

    expect(store.get("page")).toBe(5);
  });

  it("calls onChange after updates", () => {
    const onChange = vi.fn();
    const Alpine = startAlpine(createUrlPlugin({ schema: FILTER_SCHEMA, onChange }));
    const store = Alpine.store("url") as UrlStoreOf<typeof FILTER_SCHEMA>;

    store.set("page", 4);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ page: 4 }));
  });
});

describe("@ailuracode/alpine-url inference", () => {
  const schema = z.object({
    page: z.coerce.number().optional(),
    search: z.string().optional(),
    tab: z.enum(["overview", "settings", "billing"]).optional(),
  });

  type Store = UrlStoreOf<typeof schema>;

  it("infers query and get() types from Zod", () => {
    expectTypeOf<Store["query"]["page"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Store["query"]["tab"]>().toEqualTypeOf<
      "overview" | "settings" | "billing" | undefined
    >();
  });

  it("accepts compatible set() values", () => {
    expectTypeOf<Store["set"]>().toBeCallableWith("page", 2);
    expectTypeOf<Store["set"]>().toBeCallableWith("tab", "settings");
  });

  it("rejects incompatible set() values", () => {
    function assertInvalidSets(store: Store): void {
      // @ts-expect-error tab must be a valid enum value
      store.set("tab", "other");
      // @ts-expect-error unknown keys are not in the schema
      store.set("missing", 1);
    }

    expectTypeOf(assertInvalidSets).toBeFunction();
  });
});
