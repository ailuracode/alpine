import type { SidebarStore } from "./index.js";

declare global {
  namespace Alpine {
    interface Stores {
      sidebar: SidebarStore;
    }
    interface Magics<T> {
      $sidebar: SidebarStore;
    }
  }
}
