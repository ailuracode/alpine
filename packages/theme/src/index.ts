import type AlpineType from "alpinejs";

export const THEME_MODES = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeResolved = "light" | "dark";

export interface ThemeChangePayload<TMode extends ThemeMode = ThemeMode> {
  mode: TMode;
  resolved: ThemeResolved;
}

export interface ThemePluginOptions<TModes extends readonly ThemeMode[] = typeof THEME_MODES> {
  /** Cycle order and valid `set()` values. Default: light → dark → system. */
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

export type ThemeStoreOf<TModes extends readonly ThemeMode[] = typeof THEME_MODES> = ThemeStore<
  TModes[number]
>;

type ThemeConfig<TModes extends readonly ThemeMode[] = typeof THEME_MODES> = {
  storageKey: string;
  modes: TModes;
  onChange?: (payload: ThemeChangePayload<TModes[number]>) => void;
};

function isThemeModeValue<TModes extends readonly ThemeMode[]>(
  value: string | null,
  modes: TModes
): value is TModes[number] {
  return value !== null && (modes as readonly string[]).includes(value);
}

function defaultMode<TModes extends readonly ThemeMode[]>(modes: TModes): TModes[number] {
  if ((modes as readonly string[]).includes("system")) {
    return "system" as TModes[number];
  }

  return modes[0];
}

function getSystemTheme(): ThemeResolved {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme<TMode extends ThemeMode>(mode: TMode): ThemeResolved {
  return mode === "system" ? getSystemTheme() : mode;
}

function loadMode<TModes extends readonly ThemeMode[]>(
  storageKey: string,
  modes: TModes
): TModes[number] {
  const saved = localStorage.getItem(storageKey);
  return isThemeModeValue(saved, modes) ? saved : defaultMode(modes);
}

function notify<TModes extends readonly ThemeMode[], TMode extends TModes[number]>(
  config: ThemeConfig<TModes>,
  mode: TMode,
  resolved: ThemeResolved
): void {
  config.onChange?.({ mode, resolved });
}

function bootstrap<TModes extends readonly ThemeMode[]>(
  config: ThemeConfig<TModes>
): { mode: TModes[number]; resolved: ThemeResolved } {
  const mode = loadMode(config.storageKey, config.modes);
  const resolved = resolveTheme(mode);
  notify(config, mode, resolved);
  return { mode, resolved };
}

function createThemeStore<TModes extends readonly ThemeMode[]>(
  config: ThemeConfig<TModes>,
  initial: { mode: TModes[number]; resolved: ThemeResolved }
): ThemeStore<TModes[number]> {
  const { modes } = config;

  return {
    mode: initial.mode,
    resolved: initial.resolved,

    is(name) {
      return this.mode === name;
    },

    get isLight() {
      return this.mode === "light";
    },

    get isDark() {
      return this.mode === "dark";
    },

    get isSystem() {
      return this.mode === "system";
    },

    isResolved(name: ThemeResolved) {
      return this.resolved === name;
    },

    get isResolvedLight() {
      return this.resolved === "light";
    },

    get isResolvedDark() {
      return this.resolved === "dark";
    },

    set(mode) {
      if (!(modes as readonly string[]).includes(mode) || this.mode === mode) {
        return;
      }

      this.mode = mode;
      localStorage.setItem(config.storageKey, mode);
      this.refresh();
    },

    cycle() {
      const index = (modes as readonly ThemeMode[]).indexOf(this.mode);
      const next = modes[(index + 1) % modes.length] ?? modes[0];
      this.set(next);
    },

    refresh() {
      const resolved = resolveTheme(this.mode);
      if (this.resolved === resolved) {
        return false;
      }

      this.resolved = resolved;
      notify(config, this.mode, resolved);
      return true;
    },
  };
}

/** Alpine.js theme plugin. Registers `$store.theme`. */
export default function themePlugin<const TModes extends readonly ThemeMode[] = typeof THEME_MODES>(
  options: ThemePluginOptions<TModes> = {}
): AlpineType.PluginCallback {
  const modes = (options.modes ?? THEME_MODES) as TModes;
  const config: ThemeConfig<TModes> = {
    storageKey: options.storageKey ?? "theme",
    modes,
    onChange: options.onChange,
  };

  const initialTheme = bootstrap(config);

  return function registerTheme(Alpine) {
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const themeStore = createThemeStore(config, initialTheme);

    Alpine.store("theme", themeStore);

    systemQuery.addEventListener("change", () => {
      const current = Alpine.store("theme") as ThemeStore;
      if (current.isSystem) {
        current.refresh();
      }
    });
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      theme: ThemeStore;
    }
  }
}
