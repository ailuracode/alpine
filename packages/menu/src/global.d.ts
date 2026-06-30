/// <reference types="@types/alpinejs" />

export type {
  MenuInstanceOptions,
  MenuItemOptions,
  MenuOrientation,
  MenuStore,
} from "./store.js";

export interface MenuPluginOptions {
  exclusive?: boolean;
  onLockChange?: (locked: boolean) => void;
}

export function menuOptions<const T extends MenuPluginOptions>(options: T): T;
export function createMenuStore(config?: MenuPluginOptions): import("./store.js").MenuStore;

export default function menuPlugin(options?: MenuPluginOptions): import("alpinejs").PluginCallback;

declare global {
  namespace Alpine {
    interface Stores {
      menu: import("./store.js").MenuStore;
    }
    interface Magics<T> {
      $menu: import("./store.js").MenuStore;
    }
  }
}
