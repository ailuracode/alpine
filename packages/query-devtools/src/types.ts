import type {
  QueryDevtoolsEntry,
  QueryDevtoolsSnapshot,
  QueryStore,
} from "@ailuracode/alpine-query";

export interface QueryDevtoolsPluginOptions {
  /** Panel position. Default: `bottom`. */
  position?: "bottom" | "right";
  /** Start with the panel open. Default: `false`. */
  initialOpen?: boolean;
  /** Filter queries and mutations by search text. */
  filter?: string;
  /** Custom store name. Default: `query`. */
  storeName?: string;
}

export interface QueryDevtoolsController {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export type QueryDevtoolsMountOptions = QueryDevtoolsPluginOptions & {
  store: QueryStore;
};

export type { QueryDevtoolsEntry, QueryDevtoolsSnapshot };
