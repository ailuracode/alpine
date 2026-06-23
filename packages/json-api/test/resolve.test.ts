import { describe, expect, it } from "vitest";
import { resolveResourceIncluded } from "../src/resolve.js";
import type { JsonApiResource } from "../src/types.js";

describe("resolveResourceIncluded", () => {
  it("resolves to-one and to-many relationships from included resources", () => {
    const article = {
      type: "articles",
      id: "1",
      attributes: { title: "Hello", body: "World" },
      relationships: {
        author: {
          data: { type: "people", id: "9" },
        },
        comments: {
          data: [
            { type: "comments", id: "5" },
            { type: "comments", id: "missing" },
          ],
        },
      },
    } as JsonApiResource<
      {
        articles: {
          attributes: { title: string; body: string };
          relationships: {
            author: { type: "people" };
            comments: { type: "comments"; many: true };
          };
        };
        people: { attributes: { name: string } };
        comments: { attributes: { body: string } };
      },
      "articles"
    >;

    const included = [
      {
        type: "people",
        id: "9",
        attributes: { name: "Dan Gebhardt" },
      },
      {
        type: "comments",
        id: "5",
        attributes: { body: "First!" },
      },
    ] as Array<
      JsonApiResource<
        {
          articles: { attributes: { title: string; body: string } };
          people: { attributes: { name: string } };
          comments: { attributes: { body: string } };
        },
        "people" | "comments"
      >
    >;

    const resolved = resolveResourceIncluded(article, included);

    expect(resolved.relationships?.author?.resolved?.attributes.name).toBe("Dan Gebhardt");
    expect(resolved.relationships?.comments?.resolved).toHaveLength(1);
    expect(resolved.relationships?.comments?.resolved?.[0]?.attributes.body).toBe("First!");
  });

  it("sets resolved to null when relationship data is null", () => {
    const article = {
      type: "articles",
      id: "1",
      attributes: { title: "Hello", body: "World" },
      relationships: {
        author: {
          data: null,
        },
      },
    } as JsonApiResource<
      {
        articles: {
          attributes: { title: string; body: string };
          relationships: {
            author: { type: "people" };
          };
        };
        people: { attributes: { name: string } };
      },
      "articles"
    >;

    const resolved = resolveResourceIncluded(article, []);

    expect(resolved.relationships?.author?.resolved).toBeNull();
  });
});
