import type AlpineType from "alpinejs";
import { createMenuStore, type MenuStore } from "./store.js";

export {
  createMenuStore,
  type MenuInstanceOptions,
  type MenuItemOptions,
  type MenuOrientation,
  type MenuStore,
} from "./store.js";

/** Alpine.js menu plugin. Registers `$store.menu`. */
export default function menuPlugin(): AlpineType.PluginCallback {
  return function registerMenu(Alpine) {
    const store = createMenuStore();
    Alpine.store("menu", store);
    Alpine.magic("menu", () => Alpine.store("menu"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      menu: MenuStore;
    }
    interface Magics<T> {
      $menu: MenuStore;
    }
  }
}
