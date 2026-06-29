/// <reference types="@types/alpinejs" />

export declare const TOOLTIP_PLACEMENTS: readonly [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "right",
];

export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number];

export type TooltipPosition = {
  x: number;
  y: number;
  placement: TooltipPlacement;
};

export interface TooltipStore {
  instances: Record<string, import("./store.js").TooltipInstance>;
  open(id: string): void;
  close(id: string): void;
  toggle(id: string): void;
  isOpen(id: string): boolean;
  getPosition(id: string): TooltipPosition;
  register(id: string, options?: import("./store.js").TooltipInstanceOptions): void;
  unregister(id: string): void;
  bindElements(id: string, anchor: HTMLElement | null, floating: HTMLElement | null): void;
  showOnHover(id: string): void;
  hideOnHover(id: string): void;
  showOnFocus(id: string): void;
  hideOnFocus(id: string): void;
  handleKeydown(id: string, event: KeyboardEvent): void;
  refreshPosition(id: string): void;
  tooltipStyle(id: string): Record<string, string>;
  destroy(): void;
}

export function computeTooltipPosition(
  anchor: DOMRect,
  floating: DOMRect,
  placement: TooltipPlacement,
  offset?: number
): TooltipPosition;
export function createTooltipStore(): TooltipStore;

export default function tooltipPlugin(): import("alpinejs").PluginCallback;

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
