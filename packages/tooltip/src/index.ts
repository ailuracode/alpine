import type AlpineType from "alpinejs";
import { createTooltipStore, type TooltipStore } from "./store.js";

export {
  computeTooltipPosition,
  createTooltipStore,
  measureFloatingRect,
  TOOLTIP_PLACEMENTS,
  type TooltipInstanceOptions,
  type TooltipPlacement,
  type TooltipPosition,
  type TooltipStore,
} from "./store.js";

/** Alpine.js tooltip plugin. Registers `$store.tooltip`. */
export default function tooltipPlugin(): AlpineType.PluginCallback {
  return function registerTooltip(Alpine) {
    const store = createTooltipStore();
    Alpine.store("tooltip", store);
    Alpine.magic("tooltip", () => Alpine.store("tooltip"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      tooltip: TooltipStore;
    }
    interface Magics<T> {
      $tooltip: TooltipStore;
    }
  }
}
