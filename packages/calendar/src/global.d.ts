/// <reference types="@types/alpinejs" />

export type { CalendarInstance, CalendarMagic } from "./index.js";

declare global {
  namespace Alpine {
    interface Magics<T> {
      $calendar: import("./index.js").CalendarMagic;
    }
  }
}
