export type ThemeMode = "light" | "dark" | "system";
export type ThemeResolved = "light" | "dark";

export interface ThemeChangePayload {
  mode: ThemeMode;
  resolved: ThemeResolved;
}

export interface ThemePluginOptions {
  storageKey?: string;
  onChange?: (payload: ThemeChangePayload) => void;
}

export interface ThemeStore {
  mode: ThemeMode;
  resolved: ThemeResolved;
  is(name: ThemeMode): boolean;
  readonly isLight: boolean;
  readonly isDark: boolean;
  readonly isSystem: boolean;
  isResolved(name: ThemeResolved): boolean;
  readonly isResolvedLight: boolean;
  readonly isResolvedDark: boolean;
  set(mode: ThemeMode): void;
  cycle(): void;
  refresh(): boolean;
}

declare function themePlugin(options?: ThemePluginOptions): Alpine.PluginCallback;

export default themePlugin;

declare namespace Alpine {
  interface Stores {
    theme: ThemeStore;
  }
}
