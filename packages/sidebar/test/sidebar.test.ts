import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { startAlpine } from "../../../test/helpers.js";
import sidebarPlugin, {
  type SidebarPluginOptions,
  type SidebarStore,
  sidebarOptions,
} from "../src/index.js";

// ── Type inference ───────────────────────────────────────────────────

describe("@ailuracode/alpine-sidebar type inference", () => {
  it("sidebarOptions() preserves literal types via const generic", () => {
    const options = sidebarOptions({
      closeOnEscape: false,
      onShow: vi.fn(),
      onHide: vi.fn(),
      onOverlayClick: vi.fn(),
    });

    expectTypeOf(options.closeOnEscape).toEqualTypeOf<false>();
  });

  it("SidebarPluginOptions has only visibility-related callbacks", () => {
    expectTypeOf<SidebarPluginOptions>().toEqualTypeOf<{
      closeOnEscape?: boolean;
      closeOnOverlayClick?: boolean;
      breakpoint?: string;
      onShow?: () => void;
      onHide?: () => void;
      onOverlayClick?: () => void;
    }>();
  });

  it("SidebarStore exposes visibility state and computed getters", () => {
    const store = {} as SidebarStore;
    expectTypeOf(store.visible).toEqualTypeOf<boolean>();
    expectTypeOf(store.matchesBreakpoint).toEqualTypeOf<boolean>();
    expectTypeOf(store.isVisible).toEqualTypeOf<boolean>();
    expectTypeOf(store.hasOverlay).toEqualTypeOf<boolean>();
  });

  it("SidebarStore.show() takes no parameters", () => {
    const store = {} as SidebarStore;
    expectTypeOf(store.show).parameters.toEqualTypeOf<[]>();
  });

  it("SidebarStore.toggle() takes no parameters", () => {
    const store = {} as SidebarStore;
    expectTypeOf(store.toggle).parameters.toEqualTypeOf<[]>();
  });

  it("SidebarStore.hide() takes no parameters", () => {
    const store = {} as SidebarStore;
    expectTypeOf(store.hide).parameters.toEqualTypeOf<[]>();
  });

  it("plugin default infers visibility state", () => {
    const Alpine = startAlpine(sidebarPlugin());
    const sidebar = Alpine.store("sidebar") as SidebarStore;

    expectTypeOf(sidebar.visible).toEqualTypeOf<boolean>();
    expectTypeOf(sidebar.show).parameters.toEqualTypeOf<[]>();
  });

  it("sidebarOptions return type is structurally typed", () => {
    const opts = sidebarOptions({
      closeOnEscape: false,
      closeOnOverlayClick: true,
    });

    expectTypeOf(opts.closeOnEscape).toEqualTypeOf<false>();
    expectTypeOf(opts.closeOnOverlayClick).toEqualTypeOf<true>();
  });
});

// ── Runtime behavior ─────────────────────────────────────────────────

describe("@ailuracode/alpine-sidebar", () => {
  let store: SidebarStore;

  beforeEach(() => {
    const Alpine = startAlpine(sidebarPlugin());
    store = Alpine.store("sidebar") as SidebarStore;
  });

  describe("initial state", () => {
    it("starts hidden", () => {
      expect(store.visible).toBe(false);
      expect(store.isVisible).toBe(false);
      expect(store.matchesBreakpoint).toBe(false);
    });

    it("has no overlay when hidden", () => {
      expect(store.hasOverlay).toBe(false);
    });
  });

  describe("show / hide", () => {
    it("shows the sidebar", () => {
      store.show();
      expect(store.visible).toBe(true);
      expect(store.isVisible).toBe(true);
    });

    it("hides the sidebar", () => {
      store.show();
      expect(store.visible).toBe(true);

      store.hide();
      expect(store.visible).toBe(false);
      expect(store.isVisible).toBe(false);
    });

    it("does nothing when showing an already-visible sidebar", () => {
      store.show();
      store.show();
      expect(store.visible).toBe(true);
    });

    it("does nothing when hiding an already-hidden sidebar", () => {
      store.hide();
      expect(store.visible).toBe(false);
    });
  });

  describe("toggle", () => {
    it("toggles from hidden to visible", () => {
      store.toggle();
      expect(store.visible).toBe(true);
    });

    it("toggles from visible to hidden", () => {
      store.show();
      store.toggle();
      expect(store.visible).toBe(false);
    });
  });

  describe("hasOverlay", () => {
    it("returns true when visible and closeOnOverlayClick is enabled (default)", () => {
      store.show();
      expect(store.hasOverlay).toBe(true);
    });

    it("returns false when hidden", () => {
      expect(store.hasOverlay).toBe(false);
    });

    it("returns false when closeOnOverlayClick is disabled", () => {
      const Alpine = startAlpine(sidebarPlugin({ closeOnOverlayClick: false }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      expect(s.hasOverlay).toBe(false);
    });
  });

  describe("callbacks", () => {
    it("calls onShow when sidebar becomes visible", () => {
      const onShow = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onShow }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it("calls onHide when sidebar becomes hidden", () => {
      const onHide = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onHide }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      s.hide();
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it("does not call onShow when already visible", () => {
      const onShow = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onShow }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      s.show();
      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it("does not call onHide when already hidden", () => {
      const onHide = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onHide }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.hide();
      expect(onHide).not.toHaveBeenCalled();
    });

    it("toggle() invokes onShow or onHide depending on current state", () => {
      const onShow = vi.fn();
      const onHide = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onShow, onHide }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.toggle();
      expect(onShow).toHaveBeenCalledTimes(1);
      expect(onHide).not.toHaveBeenCalled();

      s.toggle();
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it("exposes onOverlayClick as a config option for consumer wiring", () => {
      const onOverlayClick = vi.fn();
      const Alpine = startAlpine(sidebarPlugin({ onOverlayClick }));
      const s = Alpine.store("sidebar") as SidebarStore;

      // onOverlayClick is a config option — consumer wires it in template
      // via @click="$store.sidebar.hide()" + their own callback logic
      s.show();
      expect(s.hasOverlay).toBe(true);
    });
  });

  describe("scroll lock via callbacks", () => {
    it("consumer can wire scroll lock through onShow/onHide", () => {
      const lockScroll = vi.fn();
      const unlockScroll = vi.fn();
      const Alpine = startAlpine(
        sidebarPlugin({
          onShow() {
            lockScroll();
          },
          onHide() {
            unlockScroll();
          },
        })
      );
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      expect(lockScroll).toHaveBeenCalledTimes(1);

      s.hide();
      expect(unlockScroll).toHaveBeenCalledTimes(1);
    });
  });

  describe("escape key", () => {
    it("hides sidebar on Escape when closeOnEscape is true (default)", () => {
      store.show();
      expect(store.visible).toBe(true);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(store.visible).toBe(false);
    });

    it("does nothing on Escape when sidebar is hidden", () => {
      expect(store.visible).toBe(false);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(store.visible).toBe(false);
    });

    it("does nothing on non-Escape keys", () => {
      store.show();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(store.visible).toBe(true);
    });

    it("closeOnEscape: false prevents hiding via Escape", () => {
      const Alpine = startAlpine(sidebarPlugin({ closeOnEscape: false }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      expect(s.visible).toBe(true);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(s.visible).toBe(true);
    });
  });

  describe("breakpoint", () => {
    it("sets matchesBreakpoint from initial media query state", () => {
      const mql = {
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => mql)
      );

      const Alpine = startAlpine(sidebarPlugin({ breakpoint: "(min-width: 1024px)" }));
      const s = Alpine.store("sidebar") as SidebarStore;

      expect(s.matchesBreakpoint).toBe(true);

      vi.unstubAllGlobals();
    });

    it("auto-hides sidebar when breakpoint no longer matches", () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
      const mql = {
        matches: true,
        addEventListener: vi.fn((event: string, handler: () => void) => {
          if (event === "change") {
            changeHandler = handler;
          }
        }),
        removeEventListener: vi.fn(),
      };
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => mql)
      );

      const Alpine = startAlpine(sidebarPlugin({ breakpoint: "(min-width: 1024px)" }));
      const s = Alpine.store("sidebar") as SidebarStore;

      s.show();
      expect(s.visible).toBe(true);

      // Simulate breakpoint change
      changeHandler?.({ matches: false } as MediaQueryListEvent);
      expect(s.visible).toBe(false);

      vi.unstubAllGlobals();
    });
  });
});
