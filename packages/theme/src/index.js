/** @typedef {'light' | 'dark' | 'system'} ThemeMode */
/** @typedef {'light' | 'dark'} ThemeResolved */

/**
 * @typedef {Object} ThemeChangePayload
 * @property {ThemeMode} mode User preference stored in localStorage.
 * @property {ThemeResolved} resolved Theme applied after resolving `system`.
 */

/**
 * @typedef {Object} ThemePluginOptions
 * @property {string} [storageKey='theme'] localStorage key for persisting `mode`.
 * @property {(payload: ThemeChangePayload) => void} [onChange] Called on bootstrap and when the theme changes.
 */

/**
 * @typedef {Object} ThemeStore
 * @property {ThemeMode} mode User preference: `light`, `dark`, or `system`.
 * @property {ThemeResolved} resolved Effective theme after resolving `system`.
 * @property {(name: ThemeMode) => boolean} is Whether `mode` matches `name`.
 * @property {boolean} isLight Whether `mode` is `light`.
 * @property {boolean} isDark Whether `mode` is `dark`.
 * @property {boolean} isSystem Whether `mode` is `system`.
 * @property {(name: ThemeResolved) => boolean} isResolved Whether `resolved` matches `name`.
 * @property {boolean} isResolvedLight Whether `resolved` is `light`.
 * @property {boolean} isResolvedDark Whether `resolved` is `dark`.
 * @property {(mode: ThemeMode) => void} set Persist and apply a new `mode`.
 * @property {() => void} cycle Rotate through `light` → `dark` → `system`.
 * @property {() => boolean} refresh Recompute `resolved`; returns whether it changed.
 */

/** @type {readonly ThemeMode[]} */
const MODES = ["light", "dark", "system"];

/** @returns {ThemeResolved} */
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * @param {ThemeMode} mode
 * @returns {ThemeResolved}
 */
function resolveTheme(mode) {
  return mode === "system" ? getSystemTheme() : mode;
}

/**
 * @param {string} storageKey
 * @returns {ThemeMode}
 */
function loadMode(storageKey) {
  const saved = localStorage.getItem(storageKey);
  return MODES.includes(/** @type {ThemeMode} */ (saved))
    ? /** @type {ThemeMode} */ (saved)
    : "system";
}

/**
 * @param {Required<Pick<ThemePluginOptions, 'storageKey'>> & Pick<ThemePluginOptions, 'onChange'>} config
 * @param {ThemeMode} mode
 * @param {ThemeResolved} resolved
 */
function notify(config, mode, resolved) {
  config.onChange?.({ mode, resolved });
}

/**
 * @param {Required<Pick<ThemePluginOptions, 'storageKey'>> & Pick<ThemePluginOptions, 'onChange'>} config
 * @returns {{ mode: ThemeMode, resolved: ThemeResolved }}
 */
function bootstrap(config) {
  const mode = loadMode(config.storageKey);
  const resolved = resolveTheme(mode);
  notify(config, mode, resolved);
  return { mode, resolved };
}

/**
 * Alpine.js theme plugin. Registers `$store.theme`.
 *
 * @param {ThemePluginOptions} [options]
 * @returns {(Alpine: import('alpinejs').Alpine) => void}
 */
export default function themePlugin(options = {}) {
  const config = {
    storageKey: options.storageKey ?? "theme",
    onChange: options.onChange ?? null,
  };

  const initialTheme = bootstrap(config);

  return function registerTheme(Alpine) {
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    Alpine.store("theme", {
      mode: initialTheme.mode,
      resolved: initialTheme.resolved,

      /** @param {ThemeMode} name */
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

      /** @param {ThemeResolved} name */
      isResolved(name) {
        return this.resolved === name;
      },

      get isResolvedLight() {
        return this.resolved === "light";
      },

      get isResolvedDark() {
        return this.resolved === "dark";
      },

      /** @param {ThemeMode} mode */
      set(mode) {
        if (!MODES.includes(mode) || this.mode === mode) {
          return;
        }

        this.mode = mode;
        localStorage.setItem(config.storageKey, mode);
        this.refresh();
      },

      cycle() {
        const index = MODES.indexOf(this.mode);
        this.set(MODES[(index + 1) % MODES.length]);
      },

      /** @returns {boolean} */
      refresh() {
        const resolved = resolveTheme(this.mode);
        if (this.resolved === resolved) {
          return false;
        }

        this.resolved = resolved;
        notify(config, this.mode, resolved);
        return true;
      },
    });

    const store = Alpine.store("theme");

    systemQuery.addEventListener("change", () => {
      if (store.isSystem) {
        store.refresh();
      }
    });
  };
}
