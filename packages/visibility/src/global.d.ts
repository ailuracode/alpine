/// <reference types="@types/alpinejs" />

export type VisibilityState = "visible" | "hidden" | "prerender";

export interface VisibilityMagic {
  isVisible: boolean;
  state: VisibilityState;
}

declare global {
  namespace Alpine {
    interface Magics<T> {
      $visibility: VisibilityMagic;
    }
  }
}
