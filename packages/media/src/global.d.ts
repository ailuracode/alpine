/// <reference types="@types/alpinejs" />

export interface ScreenInterval<Name extends string = string> {
  readonly name: Name;
  readonly maxWidth: number;
}

export interface ScreenPluginOptions<Name extends string = string> {
  intervals?: readonly ScreenInterval<Name>[];
}

export interface ScreenStore<Name extends string = string> {
  width: number;
  type: Name;
  readonly intervals: readonly ScreenInterval<Name>[];
  is(name: Name): boolean;
  refresh(): boolean;
  refreshWidth(): boolean;
}

export type ScreenSnapshot<Name extends string = string> = {
  readonly width: number;
  readonly type: Name;
};

export declare const DEFAULT_SCREEN_INTERVALS: readonly [
  ScreenInterval<"mobile">,
  ScreenInterval<"desktop">,
];

export function screenIntervals<const T extends readonly ScreenInterval[]>(intervals: T): T;
export function resolveScreenType<Name extends string>(
  width: number,
  intervals: readonly ScreenInterval<Name>[]
): Name;
export function readScreenSnapshot<Name extends string = string>(
  intervals?: readonly ScreenInterval<Name>[]
): ScreenSnapshot<Name>;
export function createDeviceAccessor<const Intervals extends readonly ScreenInterval[]>(
  intervals: Intervals
): (alpine: import("alpinejs").Alpine) => ScreenStore<Intervals[number]["name"]>;

/** @deprecated Use `ScreenInterval` and `screenIntervals()` instead. */
export type DeviceType = string;
/** @deprecated Use `ScreenStore` instead. */
export type DeviceStore = ScreenStore;
/** @deprecated Use `DEVICE_TYPES` is no longer needed: use the intervals array directly. */
export declare const DEVICE_TYPES: readonly string[];
/** @deprecated Use `DEFAULT_SCREEN_INTERVALS` instead. */
export declare const DEFAULT_DEVICE_BREAKPOINTS: Record<string, never>;
/** @deprecated Use `screenIntervals()` instead. */
export declare const deviceBreakpoints: undefined;
/** @deprecated Use `resolveScreenType()` instead. */
export declare const resolveDeviceTypeFromWidth: undefined;
/** @deprecated Use `readScreenSnapshot()` instead. */
export declare const readDeviceSnapshot: undefined;

declare global {
  namespace Alpine {
    interface Stores {
      device: ScreenStore;
    }
    interface Magics<T> {
      $device: ScreenStore;
    }
  }
}
