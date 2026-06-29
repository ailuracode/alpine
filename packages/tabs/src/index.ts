import type AlpineType from "alpinejs";
import { createTabsStore, type TabsStore } from "./store.js";

export {
  createTabsStore,
  type TabsGroupOptions,
  type TabsOrientation,
  type TabsStore,
} from "./store.js";

/** Alpine.js tabs plugin. Registers `$store.tabs`. */
export default function tabsPlugin(): AlpineType.PluginCallback {
  return function registerTabs(Alpine) {
    const store = createTabsStore();
    Alpine.store("tabs", store);
    Alpine.magic("tabs", () => Alpine.store("tabs"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      tabs: TabsStore;
    }
    interface Magics<T> {
      $tabs: TabsStore;
    }
  }
}
