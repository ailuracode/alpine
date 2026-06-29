import { z } from "zod";
import { URL_VALUE_REJECTED, type UrlSchemaHandler } from "./schema-handler.js";
import type { UrlZodSchema } from "./types.js";

function readParamValues(params: URLSearchParams, key: string): string | string[] | undefined {
  const values = params.getAll(key);
  if (values.length === 0) {
    return undefined;
  }

  return values.length === 1 ? values[0] : values;
}

function splitArrayValues(raw: string): string[] {
  if (raw.includes(",")) {
    return raw
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [raw];
}

function unwrapZodType(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current: z.ZodTypeAny = schema;

  for (;;) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
      current = current.unwrap();
      continue;
    }

    if (current instanceof z.ZodDefault) {
      current = current.removeDefault();
      continue;
    }

    const innerType = (current as unknown as { innerType?: () => z.ZodTypeAny }).innerType;
    if (typeof innerType === "function") {
      current = innerType.call(current);
      continue;
    }

    const piped = current as unknown as { in?: z.ZodTypeAny; out?: z.ZodTypeAny };
    if (piped.in?.safeParse && piped.out?.safeParse) {
      current = piped.in;
      continue;
    }

    break;
  }

  return current;
}

function isZodArray(schema: z.ZodTypeAny): schema is z.ZodArray<z.ZodTypeAny> {
  return schema instanceof z.ZodArray;
}

function rawToZodInput(schema: z.ZodTypeAny, raw: string | string[] | undefined): unknown {
  if (raw === undefined) {
    return undefined;
  }

  const inner = unwrapZodType(schema);

  if (isZodArray(inner)) {
    const values = Array.isArray(raw) ? raw : [raw];
    return values.flatMap((value) => splitArrayValues(value));
  }

  return Array.isArray(raw) ? raw[0] : raw;
}

function serializeScalar(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function serializeZodValue(schema: z.ZodTypeAny, value: unknown): string | string[] | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  const data = parsed.data;
  const inner = unwrapZodType(schema);

  if (isZodArray(inner)) {
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data.map((item) => serializeScalar(item));
  }

  if (data === null || data === undefined) {
    return null;
  }

  return serializeScalar(data);
}

/** Creates a handler that parses and serializes query params with a Zod object schema. */
export function createSchemaHandler<T extends UrlZodSchema>(schema: T): UrlSchemaHandler {
  const shape = schema.shape;

  return {
    parse(params) {
      const query: Record<string, unknown> = {};

      for (const key of Object.keys(shape)) {
        const field = shape[key] as z.ZodTypeAny | undefined;
        if (!field) {
          continue;
        }

        const raw = readParamValues(params, key);
        const input = rawToZodInput(field, raw);
        const result = field.safeParse(input);
        query[key] = result.success ? result.data : undefined;
      }

      return query;
    },

    buildSearchParams(query) {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(query)) {
        const field = shape[key] as z.ZodTypeAny | undefined;
        if (!field) {
          continue;
        }

        const serialized = serializeZodValue(field, value);
        if (serialized === null) {
          continue;
        }

        if (Array.isArray(serialized)) {
          for (const item of serialized) {
            params.append(key, item);
          }
          continue;
        }

        params.set(key, serialized);
      }

      return params;
    },

    validateValue(key, value) {
      const field = shape[key] as z.ZodTypeAny | undefined;
      if (!field) {
        return URL_VALUE_REJECTED;
      }

      if (value === null || value === undefined) {
        return value;
      }

      const result = field.safeParse(value);
      return result.success ? result.data : URL_VALUE_REJECTED;
    },
  };
}

/** Alias for a Zod object used as the URL schema (preserves literal inference). */
export function urlSchema<T extends UrlZodSchema>(schema: T): T {
  return schema;
}
