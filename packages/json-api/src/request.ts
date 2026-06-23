import type { JsonApiQueryOptions, JsonApiSchema, SchemaResourceType } from "./types.js";
import { JSON_API_MEDIA_TYPE } from "./types.js";

function appendSearchParams(
  params: URLSearchParams,
  key: string,
  value: string | number | boolean
): void {
  params.append(key, String(value));
}

function appendFields(
  params: URLSearchParams,
  fields: NonNullable<JsonApiQueryOptions<JsonApiSchema, string>["fields"]>
): void {
  for (const [type, fieldNames] of Object.entries(fields)) {
    if (!fieldNames?.length) {
      continue;
    }

    appendSearchParams(params, `fields[${type}]`, fieldNames.join(","));
  }
}

function appendPage(
  params: URLSearchParams,
  page: NonNullable<JsonApiQueryOptions<JsonApiSchema, string>["page"]>
): void {
  if (page.number !== undefined) {
    appendSearchParams(params, "page[number]", page.number);
  }

  if (page.size !== undefined) {
    appendSearchParams(params, "page[size]", page.size);
  }

  if (page.offset !== undefined) {
    appendSearchParams(params, "page[offset]", page.offset);
  }

  if (page.limit !== undefined) {
    appendSearchParams(params, "page[limit]", page.limit);
  }

  if (page.cursor !== undefined) {
    appendSearchParams(params, "page[cursor]", page.cursor);
  }
}

function appendFilter(
  params: URLSearchParams,
  filter: NonNullable<JsonApiQueryOptions<JsonApiSchema, string>["filter"]>
): void {
  for (const [key, value] of Object.entries(filter)) {
    appendSearchParams(params, `filter[${key}]`, value);
  }
}

export function buildJsonApiQuery<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
>(query?: JsonApiQueryOptions<TSchema, TType>): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  if (query.include?.length) {
    appendSearchParams(params, "include", query.include.join(","));
  }

  if (query.fields) {
    appendFields(params, query.fields);
  }

  if (query.sort?.length) {
    appendSearchParams(params, "sort", query.sort.join(","));
  }

  if (query.page) {
    appendPage(params, query.page);
  }

  if (query.filter) {
    appendFilter(params, query.filter);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function buildJsonApiUrl(
  baseUrl: string,
  type: string,
  id?: string,
  query?: string
): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const resourcePath = id ? `${type}/${encodeURIComponent(id)}` : type;
  return `${normalizedBase}/${resourcePath}${query ?? ""}`;
}

export function createJsonApiHeaders(
  headers: Record<string, string> = {},
  hasBody = false
): HeadersInit {
  const nextHeaders = new Headers(headers);

  nextHeaders.set("Accept", JSON_API_MEDIA_TYPE);

  if (hasBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", JSON_API_MEDIA_TYPE);
  }

  return nextHeaders;
}

export function createResourceDocument(
  type: string,
  payload: {
    attributes?: Record<string, unknown>;
    relationships?: Record<string, { data: unknown } | undefined>;
  },
  id?: string
): Record<string, unknown> {
  const data: Record<string, unknown> = { type };

  if (id !== undefined) {
    data.id = id;
  }

  if (payload.attributes !== undefined) {
    data.attributes = payload.attributes;
  }

  if (payload.relationships !== undefined) {
    data.relationships = Object.fromEntries(
      Object.entries(payload.relationships).filter(
        (entry): entry is [string, { data: unknown }] => {
          return entry[1] !== undefined;
        }
      )
    );
  }

  return { data };
}
