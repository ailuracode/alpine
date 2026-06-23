import type { JsonApiSchema } from "./types.js";

/** Preserves literal resource and relationship types for client inference. */
export function defineJsonApiSchema<const TSchema extends JsonApiSchema>(schema: TSchema): TSchema {
  return schema;
}
