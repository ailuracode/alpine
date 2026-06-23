import { JsonApiHttpError } from "./errors.js";
import type {
  JsonApiCollectionDocument,
  JsonApiDocument,
  JsonApiErrorObject,
  JsonApiResource,
  JsonApiResourceObject,
  JsonApiSchema,
  JsonApiSingleDocument,
  SchemaResourceType,
} from "./types.js";

function isJsonApiErrorDocument(
  document: JsonApiDocument
): document is JsonApiDocument<null> & { errors: JsonApiErrorObject[] } {
  return Array.isArray(document.errors) && document.errors.length > 0;
}

function toTypedResource<TSchema extends JsonApiSchema, TType extends SchemaResourceType<TSchema>>(
  resource: JsonApiResourceObject,
  type: TType
): JsonApiResource<TSchema, TType> {
  return {
    type,
    id: resource.id,
    attributes: (resource.attributes ?? {}) as JsonApiResource<TSchema, TType>["attributes"],
    ...(resource.relationships
      ? {
          relationships: resource.relationships as JsonApiResource<TSchema, TType>["relationships"],
        }
      : {}),
    ...(resource.links ? { links: resource.links } : {}),
    ...(resource.meta ? { meta: resource.meta } : {}),
  };
}

function mapIncluded<TSchema extends JsonApiSchema>(
  included: JsonApiResourceObject[] | undefined
): JsonApiResource<TSchema, SchemaResourceType<TSchema>>[] | undefined {
  if (!included?.length) {
    return undefined;
  }

  return included.map((resource) =>
    toTypedResource<TSchema, SchemaResourceType<TSchema>>(resource, resource.type)
  );
}

export async function readJsonApiDocument(response: Response): Promise<JsonApiDocument> {
  if (response.status === 204) {
    return { data: null };
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return { data: null };
  }

  return (await response.json()) as JsonApiDocument;
}

export async function parseJsonApiResponse<TDocument>(
  response: Response,
  mapDocument: (document: JsonApiDocument) => TDocument
): Promise<TDocument> {
  const document = await readJsonApiDocument(response);

  if (!response.ok) {
    const errors = isJsonApiErrorDocument(document) ? document.errors : [];
    throw new JsonApiHttpError(
      errors[0]?.detail ?? errors[0]?.title ?? `Request failed with status ${response.status}`,
      response,
      errors
    );
  }

  if (isJsonApiErrorDocument(document)) {
    throw new JsonApiHttpError(
      document.errors[0]?.detail ?? document.errors[0]?.title ?? "JSON:API error document",
      response,
      document.errors
    );
  }

  return mapDocument(document);
}

export function parseSingleDocument<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
>(document: JsonApiDocument, type: TType): JsonApiSingleDocument<TSchema, TType> {
  if (!document.data || Array.isArray(document.data)) {
    throw new Error(`Expected a single ${type} resource`);
  }

  if (document.data.type !== type) {
    throw new Error(`Expected resource type "${type}", received "${document.data.type}"`);
  }

  return {
    data: toTypedResource<TSchema, TType>(document.data, type),
    included: mapIncluded<TSchema>(document.included),
    ...(document.meta ? { meta: document.meta } : {}),
    ...(document.links ? { links: document.links } : {}),
  };
}

export function parseCollectionDocument<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
>(document: JsonApiDocument, type: TType): JsonApiCollectionDocument<TSchema, TType> {
  if (!Array.isArray(document.data)) {
    throw new Error(`Expected a ${type} collection`);
  }

  return {
    data: document.data.map((resource) => {
      if (resource.type !== type) {
        throw new Error(`Expected resource type "${type}", received "${resource.type}"`);
      }

      return toTypedResource<TSchema, TType>(resource, type);
    }),
    included: mapIncluded<TSchema>(document.included),
    ...(document.meta ? { meta: document.meta } : {}),
    ...(document.links ? { links: document.links } : {}),
  };
}
