import type AlpineType from "alpinejs";
import { type AccordionStore, createAccordionStore } from "./store.js";

export {
  type AccordionGroupOptions,
  type AccordionMode,
  type AccordionStore,
  createAccordionStore,
} from "./store.js";

/** Alpine.js accordion plugin. Registers `$store.accordion`. */
export default function accordionPlugin(): AlpineType.PluginCallback {
  return function registerAccordion(Alpine) {
    const store = createAccordionStore();
    Alpine.store("accordion", store);
    Alpine.magic("accordion", () => Alpine.store("accordion"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      accordion: AccordionStore;
    }
    interface Magics<T> {
      $accordion: AccordionStore;
    }
  }
}
