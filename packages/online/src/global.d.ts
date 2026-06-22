/// <reference types="@types/alpinejs" />

export interface OnlineMagic {
  isOnline: boolean;
}

declare global {
  namespace Alpine {
    interface Magics<T> {
      $online: OnlineMagic;
    }
  }
}
