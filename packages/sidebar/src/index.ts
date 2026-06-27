import type AlpineType from "alpinejs";

// ── Options ──────────────────────────────────────────────────────────

export interface SidebarPluginOptions {
  /** Close sidebar on Escape key. Default: `true`. */
  closeOnEscape?: boolean;
  /** Close sidebar when clicking the overlay. Default: `true`. */
  closeOnOverlayClick?: boolean;
  /**
   * CSS media query — sidebar auto-closes when it no longer matches.
   * Example: `'(min-width: 1024px)'` for desktop-only persistent sidebar.
   */
  breakpoint?: string;
  /** Called when the sidebar becomes visible. Use to apply CSS classes or attributes. */
  onShow?: () => void;
  /** Called when the sidebar becomes hidden. Use to remove CSS classes or attributes. */
  onHide?: () => void;
  /** Called when the overlay is clicked. Useful for custom overlay logic. */
  onOverlayClick?: () => void;
}

// ── Store ────────────────────────────────────────────────────────────

export interface SidebarStore {
  /** Whether the sidebar is currently visible. */
  visible: boolean;
  /** Whether the breakpoint media query currently matches. */
  matchesBreakpoint: boolean;
  /** Whether an overlay should be shown (visible && closeOnOverlayClick). */
  readonly hasOverlay: boolean;
  /** Whether the sidebar is visible (alias for `visible`). */
  readonly isVisible: boolean;

  /** Show the sidebar. */
  show(): void;
  /** Hide the sidebar. */
  hide(): void;
  /** Toggle the sidebar visible/hidden. */
  toggle(): void;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Builds typed sidebar plugin options with full literal inference. */
export function sidebarOptions<const T extends SidebarPluginOptions>(options: T): T {
  return options;
}

// ── Plugin ───────────────────────────────────────────────────────────

/** Alpine.js sidebar plugin. Registers `$store.sidebar`. */
export default function sidebarPlugin(
  options: SidebarPluginOptions = {}
): AlpineType.PluginCallback {
  const config = {
    closeOnEscape: options.closeOnEscape ?? true,
    closeOnOverlayClick: options.closeOnOverlayClick ?? true,
    breakpoint: options.breakpoint,
    onShow: options.onShow as (() => void) | undefined,
    onHide: options.onHide as (() => void) | undefined,
    onOverlayClick: options.onOverlayClick as (() => void) | undefined,
  };

  return function registerSidebar(Alpine) {
    let escapeHandler: ((event: KeyboardEvent) => void) | null = null;
    let breakpointQuery: MediaQueryList | null = null;
    let breakpointHandler: ((event: MediaQueryListEvent) => void) | null = null;

    const store: SidebarStore = {
      visible: false,
      matchesBreakpoint: false,

      get hasOverlay() {
        return this.visible && config.closeOnOverlayClick;
      },

      get isVisible() {
        return this.visible;
      },

      show() {
        if (this.visible) {
          return;
        }
        this.visible = true;
        config.onShow?.();
      },

      hide() {
        if (!this.visible) {
          return;
        }
        this.visible = false;
        config.onHide?.();
      },

      toggle() {
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      },
    };

    Alpine.store("sidebar", store);
    Alpine.magic("sidebar", () => Alpine.store("sidebar"));

    const sidebar = Alpine.store("sidebar") as SidebarStore;

    // Escape key listener
    if (config.closeOnEscape) {
      escapeHandler = (event: KeyboardEvent) => {
        if (event.key === "Escape" && sidebar.visible) {
          sidebar.hide();
        }
      };
      window.addEventListener("keydown", escapeHandler);
    }

    // Breakpoint listener
    if (config.breakpoint) {
      breakpointQuery = window.matchMedia(config.breakpoint);
      sidebar.matchesBreakpoint = breakpointQuery.matches;

      breakpointHandler = (event: MediaQueryListEvent) => {
        sidebar.matchesBreakpoint = event.matches;

        // Auto-close when breakpoint no longer matches
        if (!event.matches && sidebar.visible) {
          sidebar.hide();
        }
      };

      breakpointQuery.addEventListener("change", breakpointHandler);
    }
  };
}
