/// <reference types="@types/alpinejs" />

export interface QueryDevtoolsPluginOptions {
  position?: "bottom" | "right";
  initialOpen?: boolean;
  filter?: string;
  storeName?: string;
}

export interface QueryDevtoolsController {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}
