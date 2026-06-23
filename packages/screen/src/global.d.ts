/// <reference types="@types/alpinejs" />

export declare const DEVICE_TYPES: readonly ["mobile", "tablet", "desktop"];

export type DeviceType = (typeof DEVICE_TYPES)[number];

export declare const DEFAULT_DEVICE_BREAKPOINTS: {
  readonly mobileMax: 767;
  readonly tabletMax: 1023;
};

export type DeviceBreakpoints = {
  mobileMax?: number;
  tabletMax?: number;
};

export type DeviceSnapshot = {
  readonly width: number;
  readonly mobileMax: number;
  readonly tabletMax: number;
  readonly type: DeviceType;
};

export interface DeviceStore {
  mobileMax: number;
  tabletMax: number;
  width: number;
  type: DeviceType;
  is(name: DeviceType): boolean;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
  refreshType(): void;
  refreshWidth(): void;
  refresh(): void;
  setBreakpoints(breakpoints?: DeviceBreakpoints): void;
}

export function deviceBreakpoints<const T extends DeviceBreakpoints>(breakpoints: T): T;
export function resolveDeviceTypeFromWidth(
  width: number,
  breakpoints?: DeviceBreakpoints
): DeviceType;
export function readDeviceSnapshot(breakpoints?: DeviceBreakpoints): DeviceSnapshot;

declare global {
  namespace Alpine {
    interface Stores {
      device: DeviceStore;
    }
  }
}
