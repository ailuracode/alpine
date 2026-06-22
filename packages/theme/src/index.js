const MODES = ["light", "dark", "system"];

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode) {
  return mode === "system" ? getSystemTheme() : mode;
}

function loadMode(storageKey) {
  const saved = localStorage.getItem(storageKey);
  return MODES.includes(saved) ? saved : "system";
}

function notify(config, mode, resolved) {
  config.onChange?.({ mode, resolved });
}

function bootstrap(config) {
  const mode = loadMode(config.storageKey);
  const resolved = resolveTheme(mode);
  notify(config, mode, resolved);
  return { mode, resolved };
}

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

      isResolved(name) {
        return this.resolved === name;
      },

      get isResolvedLight() {
        return this.resolved === "light";
      },

      get isResolvedDark() {
        return this.resolved === "dark";
      },

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
