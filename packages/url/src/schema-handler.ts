export const URL_VALUE_REJECTED = Symbol("url-value-rejected");

export type UrlSchemaHandler = {
  parse(params: URLSearchParams): Record<string, unknown>;
  buildSearchParams(query: Record<string, unknown>): URLSearchParams;
  validateValue(key: string, value: unknown): unknown | typeof URL_VALUE_REJECTED;
};
