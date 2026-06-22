/// <reference types="@types/alpinejs" />

export interface TouchMagic {
  isTouch: boolean;
  isCoarse: boolean;
  isFine: boolean;
  canHover: boolean;
  maxTouchPoints: number;
}

declare global {
  namespace Alpine {
    interface Magics<T> {
      $touch: TouchMagic;
    }
  }
}
