import type {
  JsonApiRelationship,
  JsonApiResource,
  JsonApiResourceIdentifier,
  JsonApiResourceObject,
  JsonApiSchema,
  SchemaResourceType,
} from "./types.js";

function resourcePointer(type: string, id: string): string {
  return `${type}:${id}`;
}

function buildIncludedIndex<TSchema extends JsonApiSchema>(
  included: JsonApiResource<TSchema, SchemaResourceType<TSchema>>[] | undefined
): Map<string, JsonApiResource<TSchema, SchemaResourceType<TSchema>>> {
  const index = new Map<string, JsonApiResource<TSchema, SchemaResourceType<TSchema>>>();

  for (const resource of included ?? []) {
    index.set(resourcePointer(resource.type, resource.id), resource);
  }

  return index;
}

function lookupIncludedResource<TSchema extends JsonApiSchema>(
  index: Map<string, JsonApiResource<TSchema, SchemaResourceType<TSchema>>>,
  identifier: JsonApiResourceIdentifier
): JsonApiResource<TSchema, SchemaResourceType<TSchema>> | null {
  return index.get(resourcePointer(identifier.type, identifier.id)) ?? null;
}

function resolveRelationship<TSchema extends JsonApiSchema>(
  relationship: JsonApiRelationship,
  index: Map<string, JsonApiResource<TSchema, SchemaResourceType<TSchema>>>
): JsonApiRelationship & { resolved: unknown } {
  const { data } = relationship;

  if (data === null) {
    return { ...relationship, resolved: null };
  }

  if (Array.isArray(data)) {
    const resolved = data
      .map((identifier) => lookupIncludedResource(index, identifier))
      .filter((resource): resource is JsonApiResource<TSchema, SchemaResourceType<TSchema>> => {
        return resource !== null;
      });

    return { ...relationship, resolved };
  }

  return {
    ...relationship,
    resolved: lookupIncludedResource(index, data),
  };
}

export function resolveResourceIncluded<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
>(
  resource: JsonApiResource<TSchema, TType>,
  included: JsonApiResource<TSchema, SchemaResourceType<TSchema>>[] | undefined
): JsonApiResource<TSchema, TType> {
  if (!resource.relationships) {
    return resource;
  }

  const index = buildIncludedIndex(included);
  const relationships = Object.fromEntries(
    Object.entries(resource.relationships).map(([name, relationship]) => {
      return [name, resolveRelationship(relationship as JsonApiRelationship, index)];
    })
  ) as JsonApiResource<TSchema, TType>["relationships"];

  return {
    ...resource,
    relationships,
  };
}

export function indexIncludedResources(
  included: JsonApiResourceObject[] | undefined
): Map<string, JsonApiResourceObject> {
  const index = new Map<string, JsonApiResourceObject>();

  for (const resource of included ?? []) {
    index.set(resourcePointer(resource.type, resource.id), resource);
  }

  return index;
}
