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
  /** Whether the sidebar starts collapsed. Default: `false`. */
  collapsed?: boolean;
  /** Called when sidebar opens. Use to apply CSS classes or attributes. */
  onOpen?: () => void;
  /** Called when sidebar closes. Use to remove CSS classes or attributes. */
  onClose?: () => void;
  /** Called when overlay is clicked. Useful for custom overlay logic. */
  onOverlayClick?: () => void;
  /** Called when sidebar collapses to compact mode. */
  onCollapse?: () => void;
  /** Called when sidebar expands from compact mode. */
  onExpand?: () => void;
}

// ── Store ────────────────────────────────────────────────────────────

export interface SidebarStore {
  /** Whether the sidebar is currently open. */
  open: boolean;
  /** Whether the sidebar is in collapsed (compact) mode. */
  collapsed: boolean;
  /** Whether the breakpoint media query currently matches. */
  matchesBreakpoint: boolean;
  /** Whether an overlay is shown (open && closeOnOverlayClick). */
  readonly hasOverlay: boolean;
  /** Whether the sidebar is open (alias for `open`). */
  readonly isOpen: boolean;

  /** Show the sidebar. */
  show(): void;
  /** Hide the sidebar. */
  hide(): void;
  /** Toggle the sidebar open/closed. */
  toggle(): void;
  /** Collapse the sidebar to compact mode. */
  collapse(): void;
  /** Expand the sidebar from compact mode. */
  expand(): void;
  /** Toggle between collapsed and expanded. */
  toggleCollapse(): void;
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
    collapsed: options.collapsed ?? false,
    onOpen: options.onOpen as (() => void) | undefined,
    onClose: options.onClose as (() => void) | undefined,
    onOverlayClick: options.onOverlayClick as (() => void) | undefined,
    onCollapse: options.onCollapse as (() => void) | undefined,
    onExpand: options.onExpand as (() => void) | undefined,
  };

  return function registerSidebar(Alpine) {
    let escapeHandler: ((event: KeyboardEvent) => void) | null = null;
    let breakpointQuery: MediaQueryList | null = null;
    let breakpointHandler: ((event: MediaQueryListEvent) => void) | null = null;

    const store: SidebarStore = {
      open: false,
      collapsed: config.collapsed,
      matchesBreakpoint: false,

      get hasOverlay() {
        return this.open && config.closeOnOverlayClick;
      },

      get isOpen() {
        return this.open;
      },

      show() {
        if (this.open) {
          return;
        }
        this.open = true;
        config.onOpen?.();
      },

      hide() {
        if (!this.open) {
          return;
        }
        this.open = false;
        config.onClose?.();
      },

      toggle() {
        if (this.open) {
          this.hide();
        } else {
          this.show();
        }
      },

      collapse() {
        if (this.collapsed) {
          return;
        }
        this.collapsed = true;
        config.onCollapse?.();
      },

      expand() {
        if (!this.collapsed) {
          return;
        }
        this.collapsed = false;
        config.onExpand?.();
      },

      toggleCollapse() {
        if (this.collapsed) {
          this.expand();
        } else {
          this.collapse();
        }
      },
    };

    Alpine.store("sidebar", store);
    Alpine.magic("sidebar", () => Alpine.store("sidebar"));

    // Escape key listener
    if (config.closeOnEscape) {
      escapeHandler = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          const s = Alpine.store("sidebar") as SidebarStore;
          if (s.open) {
            s.hide();
          }
        }
      };
      window.addEventListener("keydown", escapeHandler);
    }

    // Breakpoint listener
    if (config.breakpoint) {
      breakpointQuery = window.matchMedia(config.breakpoint);
      const s = Alpine.store("sidebar") as SidebarStore;
      s.matchesBreakpoint = breakpointQuery.matches;

      breakpointHandler = (event: MediaQueryListEvent) => {
        const current = Alpine.store("sidebar") as SidebarStore;
        current.matchesBreakpoint = event.matches;

        // Auto-close when breakpoint no longer matches
        if (!event.matches && current.open) {
          current.hide();
        }
      };

      breakpointQuery.addEventListener("change", breakpointHandler);
    }
  };
}
