import type AlpineType from "alpinejs";
import { type CarouselStore, createCarouselStore } from "./store.js";

export {
  type CarouselAutoplayOptions,
  type CarouselInstance,
  type CarouselOptions,
  type CarouselStore,
  createCarouselStore,
} from "./store.js";

/** Alpine.js carousel plugin. Registers `$store.carousel`. */
export default function carouselPlugin(): AlpineType.PluginCallback {
  return function registerCarousel(Alpine) {
    const store = createCarouselStore();
    Alpine.store("carousel", store);
    Alpine.magic("carousel", () => Alpine.store("carousel"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      carousel: CarouselStore;
    }
    interface Magics<T> {
      $carousel: CarouselStore;
    }
  }
}
