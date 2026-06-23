/// <reference types="@types/alpinejs" />

export type ThemeMode = "light" | "dark" | "system";
export type ThemeResolved = "light" | "dark";

export interface ThemeChangePayload<TMode extends ThemeMode = ThemeMode> {
  mode: TMode;
  resolved: ThemeResolved;
}

export interface ThemePluginOptions<
  TModes extends readonly ThemeMode[] = readonly ["light", "dark", "system"],
> {
  modes?: TModes;
  storageKey?: string;
  onChange?: (payload: ThemeChangePayload<TModes[number]>) => void;
}

export interface ThemeStore<TMode extends ThemeMode = ThemeMode> {
  mode: TMode;
  resolved: ThemeResolved;
  is(name: TMode): boolean;
  readonly isLight: boolean;
  readonly isDark: boolean;
  readonly isSystem: boolean;
  isResolved(name: ThemeResolved): boolean;
  readonly isResolvedLight: boolean;
  readonly isResolvedDark: boolean;
  set(mode: TMode): void;
  cycle(): void;
  refresh(): boolean;
}

export type ThemeStoreOf<
  TModes extends readonly ThemeMode[] = readonly ["light", "dark", "system"],
> = ThemeStore<TModes[number]>;

declare global {
  namespace Alpine {
    interface Stores {
      theme: ThemeStore;
    }
  }
}
