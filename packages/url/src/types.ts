import type { z } from "zod";

/** Zod object schema for URL query params (Zod 3 and 4). */
export type UrlZodSchema = {
  shape: Record<
    string,
    {
      safeParse(value: unknown): { success: boolean; data?: unknown };
    }
  >;
};

type InferUrlShape<T extends UrlZodSchema> = {
  [K in keyof T["shape"] & string]: T["shape"][K] extends z.ZodTypeAny
    ? z.infer<T["shape"][K]>
    : never;
};

export type UrlQuery<T extends UrlZodSchema> = Partial<InferUrlShape<T>>;

export type UrlQueryUpdates<T extends UrlZodSchema> = Partial<{
  [K in keyof T["shape"] & string]: InferUrlShape<T>[K] | null | undefined;
}>;

export type UrlStoreKey<T extends UrlZodSchema> = keyof T["shape"] & string;

export type UrlQueryValue<T extends UrlZodSchema, K extends UrlStoreKey<T>> =
  | InferUrlShape<T>[K]
  | null
  | undefined;

export interface UrlPluginOptions<T extends UrlZodSchema> {
  /** Zod object schema for typed query params. */
  schema: T;
  /** Update the URL when `set`, `remove`, `push`, or `replace` run. Default: `true`. */
  syncUrl?: boolean;
  /** Use `history.pushState` in `set` instead of `replaceState`. Default: `false`. */
  pushOnSet?: boolean;
  /** Called after the reactive query object changes. */
  onChange?: (query: UrlQuery<T>) => void;
}

export type UrlStore<T extends UrlZodSchema> = {
  query: UrlQuery<T>;
  readonly search: string;
  get<K extends UrlStoreKey<T>>(key: K): UrlQueryValue<T, K>;
  set<K extends UrlStoreKey<T>>(key: K, value: UrlQueryValue<T, K>): void;
  has<K extends UrlStoreKey<T>>(key: K): boolean;
  remove<K extends UrlStoreKey<T>>(key: K): void;
  push(updates?: UrlQueryUpdates<T>, state?: unknown): void;
  replace(updates?: UrlQueryUpdates<T>, state?: unknown): void;
  sync(): void;
};

export type UrlStoreOf<T extends UrlZodSchema> = UrlStore<T>;

/** Typed URL store from `z.infer<typeof schema>` — use in app-level Alpine augmentation. */
export type UrlStoreFor<TQuery extends Record<string, unknown>> = {
  query: Partial<TQuery>;
  readonly search: string;
  get<K extends keyof TQuery & string>(key: K): TQuery[K] | null | undefined;
  set<K extends keyof TQuery & string>(key: K, value: TQuery[K] | null | undefined): void;
  has<K extends keyof TQuery & string>(key: K): boolean;
  remove<K extends keyof TQuery & string>(key: K): void;
  push(
    updates?: Partial<{ [K in keyof TQuery & string]: TQuery[K] | null | undefined }>,
    state?: unknown
  ): void;
  replace(
    updates?: Partial<{ [K in keyof TQuery & string]: TQuery[K] | null | undefined }>,
    state?: unknown
  ): void;
  sync(): void;
};
