/// <reference types="@types/alpinejs" />

export type ClipboardMagic = (text: string) => Promise<void>;

declare global {
  namespace Alpine {
    interface Magics<T> {
      $clipboard: ClipboardMagic;
    }
  }
}
