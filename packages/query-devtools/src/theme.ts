export type DevtoolsTheme = "light" | "dark" | "system";

const noop = (): void => undefined;

export function resolveHostTheme(root: HTMLElement = document.documentElement): "light" | "dark" {
  const dataTheme = root.dataset.theme;

  if (dataTheme === "light" || dataTheme === "dark") {
    return dataTheme;
  }

  if (root.classList.contains("dark")) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveDevtoolsTheme(theme: DevtoolsTheme): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return resolveHostTheme();
}

export function applyDevtoolsThemeClass(element: HTMLElement, theme: DevtoolsTheme): void {
  element.classList.remove("aq-devtools-root--light", "aq-devtools-root--dark");
  element.classList.add(`aq-devtools-root--${resolveDevtoolsTheme(theme)}`);
}

/** Apply theme classes and watch host changes when `theme` is `"system"`. */
export function bindDevtoolsTheme(element: HTMLElement, theme: DevtoolsTheme): () => void {
  const apply = (): void => {
    applyDevtoolsThemeClass(element, theme);
  };

  apply();

  if (theme !== "system") {
    return noop;
  }

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", apply);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener("change", apply);
  };
}
