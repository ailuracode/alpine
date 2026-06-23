/// <reference types="@types/alpinejs" />

export declare const PLATFORM_NAMES: readonly [
  "macos",
  "windows",
  "linux",
  "ios",
  "android",
  "chromeos",
  "unknown",
];

export type PlatformName = (typeof PLATFORM_NAMES)[number];

export type PlatformFlags = {
  readonly isMac: boolean;
  readonly isWindows: boolean;
  readonly isLinux: boolean;
  readonly isIos: boolean;
  readonly isAndroid: boolean;
  readonly isChromeos: boolean;
};

export type PlatformSnapshot = PlatformFlags & {
  readonly name: PlatformName;
};

export interface PlatformMagic extends PlatformSnapshot {
  is(platform: PlatformName): boolean;
}

export function detectPlatformName(): PlatformName;
export function isIosDevice(): boolean;
export function isAndroidDevice(): boolean;
export function isChromeOsDevice(): boolean;
export function isWindowsDevice(): boolean;
export function isMacDevice(): boolean;
export function isLinuxDevice(): boolean;
export function platformFlags(name: PlatformName): PlatformFlags;
export function readPlatformState(): PlatformSnapshot;
export function createPlatformState(): PlatformMagic;

declare global {
  namespace Alpine {
    interface Magics<T> {
      $platform: PlatformMagic;
    }
  }
}
