/// <reference types="@types/alpinejs" />

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceBreakpoints {
  mobileMax?: number;
  tabletMax?: number;
}

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

declare global {
  namespace Alpine {
    interface Stores {
      device: DeviceStore;
    }
  }
}
