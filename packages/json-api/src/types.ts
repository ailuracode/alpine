export const JSON_API_MEDIA_TYPE = "application/vnd.api+json" as const;

export type JsonApiLinks = Record<string, string | JsonApiLinkObject>;

export interface JsonApiLinkObject {
  href: string;
  meta?: Record<string, unknown>;
}

export interface JsonApiErrorObject {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: Record<string, unknown>;
}

export interface JsonApiResourceIdentifier {
  type: string;
  id: string;
  meta?: Record<string, unknown>;
}

export interface JsonApiRelationship {
  data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null;
  links?: JsonApiLinks;
  meta?: Record<string, unknown>;
}

export interface JsonApiResourceObject {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, JsonApiRelationship>;
  links?: JsonApiLinks;
  meta?: Record<string, unknown>;
}

export interface JsonApiDocument<TData = JsonApiResourceObject | JsonApiResourceObject[] | null> {
  data: TData;
  included?: JsonApiResourceObject[];
  errors?: JsonApiErrorObject[];
  meta?: Record<string, unknown>;
  links?: JsonApiLinks;
  jsonapi?: {
    version?: string;
    meta?: Record<string, unknown>;
  };
}

export interface RelationshipSchema {
  type: string;
  many?: boolean;
}

export interface ResourceSchema {
  attributes: Record<string, unknown>;
  relationships?: Record<string, RelationshipSchema>;
}

export type JsonApiSchema = Record<string, ResourceSchema>;

export type SchemaResourceType<TSchema extends JsonApiSchema> = keyof TSchema & string;

export type InferAttributes<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = TSchema[TType] extends { attributes: infer TAttributes }
  ? TAttributes extends Record<string, unknown>
    ? TAttributes
    : never
  : never;

export type InferRelationshipNames<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = TSchema[TType] extends { relationships: infer TRelationships }
  ? TRelationships extends Record<string, RelationshipSchema>
    ? keyof TRelationships & string
    : never
  : never;

export type InferRelationshipTarget<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
  TRelationship extends InferRelationshipNames<TSchema, TType>,
> = TSchema[TType] extends { relationships: infer TRelationships }
  ? TRelationships extends Record<string, RelationshipSchema>
    ? TRelationship extends keyof TRelationships
      ? TRelationships[TRelationship]["type"]
      : never
    : never
  : never;

export type JsonApiRelationshipData<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
  TRelationship extends InferRelationshipNames<TSchema, TType>,
> = TSchema[TType] extends { relationships: infer TRelationships }
  ? TRelationships extends Record<string, RelationshipSchema>
    ? TRelationship extends keyof TRelationships
      ? TRelationships[TRelationship] extends { many: true }
        ? Array<{
            type: TRelationships[TRelationship]["type"];
            id: string;
          }>
        : {
            type: TRelationships[TRelationship]["type"];
            id: string;
          } | null
      : never
    : never
  : never;

export type JsonApiResource<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  type: TType;
  id: string;
  attributes: InferAttributes<TSchema, TType>;
  relationships?: {
    [TRelationship in InferRelationshipNames<TSchema, TType>]?: {
      data: JsonApiRelationshipData<TSchema, TType, TRelationship>;
      links?: JsonApiLinks;
      meta?: Record<string, unknown>;
    };
  };
  links?: JsonApiLinks;
  meta?: Record<string, unknown>;
};

export type JsonApiSingleDocument<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  data: JsonApiResource<TSchema, TType>;
  included?: JsonApiResource<TSchema, SchemaResourceType<TSchema>>[];
  meta?: Record<string, unknown>;
  links?: JsonApiLinks;
};

export type JsonApiCollectionDocument<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  data: Array<JsonApiResource<TSchema, TType>>;
  included?: JsonApiResource<TSchema, SchemaResourceType<TSchema>>[];
  meta?: Record<string, unknown>;
  links?: JsonApiLinks;
};

export type JsonApiQueryOptions<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  include?: readonly InferRelationshipNames<TSchema, TType>[];
  fields?: Partial<{
    [TFieldType in SchemaResourceType<TSchema>]: readonly (keyof InferAttributes<
      TSchema,
      TFieldType
    > &
      string)[];
  }>;
  sort?: readonly string[];
  page?: {
    number?: number;
    size?: number;
    offset?: number;
    limit?: number;
    cursor?: string;
  };
  filter?: Record<string, string | number | boolean>;
};

export type JsonApiRelationshipPayload<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  [TRelationship in InferRelationshipNames<TSchema, TType>]?: {
    data: JsonApiRelationshipData<TSchema, TType, TRelationship>;
  };
};

export type JsonApiCreatePayload<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  attributes: InferAttributes<TSchema, TType>;
  relationships?: JsonApiRelationshipPayload<TSchema, TType>;
};

export type JsonApiUpdatePayload<
  TSchema extends JsonApiSchema,
  TType extends SchemaResourceType<TSchema>,
> = {
  attributes?: Partial<InferAttributes<TSchema, TType>>;
  relationships?: JsonApiRelationshipPayload<TSchema, TType>;
};

export interface JsonApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  headers?: Record<string, string>;
}

export interface JsonApiPluginOptions<TSchema extends JsonApiSchema> extends JsonApiClientOptions {
  schema: TSchema;
}

export interface JsonApiClient<TSchema extends JsonApiSchema> {
  readonly schema: TSchema;
  findAll<TType extends SchemaResourceType<TSchema>>(
    type: TType,
    query?: JsonApiQueryOptions<TSchema, TType>
  ): Promise<JsonApiCollectionDocument<TSchema, TType>>;
  findOne<TType extends SchemaResourceType<TSchema>>(
    type: TType,
    id: string,
    query?: JsonApiQueryOptions<TSchema, TType>
  ): Promise<JsonApiSingleDocument<TSchema, TType>>;
  create<TType extends SchemaResourceType<TSchema>>(
    type: TType,
    payload: JsonApiCreatePayload<TSchema, TType>
  ): Promise<JsonApiSingleDocument<TSchema, TType>>;
  update<TType extends SchemaResourceType<TSchema>>(
    type: TType,
    id: string,
    payload: JsonApiUpdatePayload<TSchema, TType>
  ): Promise<JsonApiSingleDocument<TSchema, TType>>;
  delete<TType extends SchemaResourceType<TSchema>>(type: TType, id: string): Promise<void>;
}
