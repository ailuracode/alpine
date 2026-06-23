import type { JsonApiErrorObject } from "./types.js";

export class JsonApiHttpError extends Error {
  override readonly name = "JsonApiHttpError";

  constructor(
    message: string,
    readonly response: Response,
    readonly errors: readonly JsonApiErrorObject[]
  ) {
    super(message);
  }

  get status(): number {
    return this.response.status;
  }
}
