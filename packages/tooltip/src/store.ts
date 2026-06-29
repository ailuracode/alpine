export const TOOLTIP_PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "right",
] as const;

export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number];

export type TooltipPosition = {
  x: number;
  y: number;
  placement: TooltipPlacement;
};

export type TooltipInstanceOptions = {
  placement?: TooltipPlacement;
  offset?: number;
  openDelay?: number;
  closeDelay?: number;
  onOpen?: () => void;
  onClose?: () => void;
};

export type TooltipInstance = {
  open: boolean;
  placement: TooltipPlacement;
  offset: number;
  openDelay: number;
  closeDelay: number;
  anchor: HTMLElement | null;
  floating: HTMLElement | null;
  position: TooltipPosition;
  openTimer: ReturnType<typeof setTimeout> | null;
  closeTimer: ReturnType<typeof setTimeout> | null;
  onOpen?: () => void;
  onClose?: () => void;
};

export type TooltipStore = {
  /** Reactive registry of tooltip instances. */
  instances: Record<string, TooltipInstance>;
  open(id: string): void;
  close(id: string): void;
  toggle(id: string): void;
  isOpen(id: string): boolean;
  getPosition(id: string): TooltipPosition;
  register(id: string, options?: TooltipInstanceOptions): void;
  unregister(id: string): void;
  bindElements(id: string, anchor: HTMLElement | null, floating: HTMLElement | null): void;
  showOnHover(id: string): void;
  hideOnHover(id: string): void;
  showOnFocus(id: string): void;
  hideOnFocus(id: string): void;
  handleKeydown(id: string, event: KeyboardEvent): void;
  refreshPosition(id: string): void;
  tooltipStyle(id: string): Record<string, string>;
  destroy(): void;
};

/** Measures the floating node even before Alpine toggles visibility. */
export function measureFloatingRect(floating: HTMLElement): DOMRect {
  const rect = floating.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return rect;
  }

  const { style } = floating;
  const snapshot = {
    visibility: style.visibility,
    display: style.display,
    position: style.position,
    top: style.top,
    left: style.left,
  };

  style.visibility = "hidden";
  style.display = "block";
  style.position = "fixed";
  style.top = "0px";
  style.left = "0px";

  const measured = floating.getBoundingClientRect();
  const width = measured.width || floating.scrollWidth || floating.offsetWidth;
  const height = measured.height || floating.scrollHeight || floating.offsetHeight;

  style.visibility = snapshot.visibility;
  style.display = snapshot.display;
  style.position = snapshot.position;
  style.top = snapshot.top;
  style.left = snapshot.left;

  if (width > 0 && height > 0) {
    return new DOMRect(0, 0, width, height);
  }

  return new DOMRect(0, 0, floating.offsetWidth, floating.offsetHeight);
}

/** Computes basic tooltip coordinates without Floating UI. */
export function computeTooltipPosition(
  anchor: DOMRect,
  floating: DOMRect,
  placement: TooltipPlacement,
  offset = 8
): TooltipPosition {
  const centerX = anchor.left + anchor.width / 2;
  const centerY = anchor.top + anchor.height / 2;

  switch (placement) {
    case "top":
      return {
        x: centerX - floating.width / 2,
        y: anchor.top - floating.height - offset,
        placement,
      };
    case "top-start":
      return { x: anchor.left, y: anchor.top - floating.height - offset, placement };
    case "top-end":
      return {
        x: anchor.right - floating.width,
        y: anchor.top - floating.height - offset,
        placement,
      };
    case "bottom":
      return { x: centerX - floating.width / 2, y: anchor.bottom + offset, placement };
    case "bottom-start":
      return { x: anchor.left, y: anchor.bottom + offset, placement };
    case "bottom-end":
      return { x: anchor.right - floating.width, y: anchor.bottom + offset, placement };
    case "left":
      return {
        x: anchor.left - floating.width - offset,
        y: centerY - floating.height / 2,
        placement,
      };
    case "right":
      return { x: anchor.right + offset, y: centerY - floating.height / 2, placement };
    default:
      return { x: centerX - floating.width / 2, y: anchor.bottom + offset, placement: "bottom" };
  }
}

function createInstance(options: TooltipInstanceOptions = {}): TooltipInstance {
  return {
    open: false,
    placement: options.placement ?? "top",
    offset: options.offset ?? 8,
    openDelay: options.openDelay ?? 0,
    closeDelay: options.closeDelay ?? 0,
    anchor: null,
    floating: null,
    position: { x: 0, y: 0, placement: options.placement ?? "top" },
    openTimer: null,
    closeTimer: null,
    onOpen: options.onOpen,
    onClose: options.onClose,
  };
}

function clearTimer(timer: ReturnType<typeof setTimeout> | null): void {
  if (timer) {
    clearTimeout(timer);
  }
}

/** Creates the headless tooltip store. */
export function createTooltipStore(): TooltipStore {
  function getOrCreate(store: TooltipStore, id: string): TooltipInstance {
    store.instances[id] ??= createInstance();
    return store.instances[id];
  }

  function refresh(instance: TooltipInstance): void {
    if (!(instance.anchor && instance.floating) || typeof window === "undefined") {
      return;
    }

    instance.position = computeTooltipPosition(
      instance.anchor.getBoundingClientRect(),
      measureFloatingRect(instance.floating),
      instance.placement,
      instance.offset
    );
  }

  function scheduleRefresh(instance: TooltipInstance): void {
    const run = () => refresh(instance);

    queueMicrotask(run);

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        run();
        requestAnimationFrame(run);
      });
    }

    if (instance.floating && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        run();
        observer.disconnect();
      });
      observer.observe(instance.floating);
    }
  }

  const store: TooltipStore = {
    instances: {},

    register(id, options = {}) {
      this.instances[id] = createInstance(options);
    },

    unregister(id) {
      const instance = this.instances[id];
      if (instance) {
        clearTimer(instance.openTimer);
        clearTimer(instance.closeTimer);
      }
      delete this.instances[id];
    },

    open(id) {
      const instance = getOrCreate(this, id);
      clearTimer(instance.closeTimer);
      instance.closeTimer = null;

      const openNow = () => {
        if (instance.open) {
          return;
        }
        instance.open = true;
        scheduleRefresh(instance);
        instance.onOpen?.();
      };

      if (instance.openDelay > 0) {
        instance.openTimer = setTimeout(openNow, instance.openDelay);
        return;
      }

      openNow();
    },

    close(id) {
      const instance = this.instances[id];
      if (!instance) {
        return;
      }

      clearTimer(instance.openTimer);
      instance.openTimer = null;

      const closeNow = () => {
        if (!instance.open) {
          return;
        }
        instance.open = false;
        instance.onClose?.();
      };

      if (instance.closeDelay > 0) {
        instance.closeTimer = setTimeout(closeNow, instance.closeDelay);
        return;
      }

      closeNow();
    },

    toggle(id) {
      if (this.isOpen(id)) {
        this.close(id);
      } else {
        this.open(id);
      }
    },

    isOpen(id) {
      return this.instances[id]?.open ?? false;
    },

    getPosition(id) {
      const instance = this.instances[id];
      return instance?.position ?? { x: 0, y: 0, placement: "top" };
    },

    bindElements(id, anchor, floating) {
      const instance = getOrCreate(this, id);
      instance.anchor = anchor;
      instance.floating = floating;
      if (instance.open) {
        scheduleRefresh(instance);
      }
    },

    showOnHover(id) {
      this.open(id);
    },

    hideOnHover(id) {
      this.close(id);
    },

    showOnFocus(id) {
      this.open(id);
    },

    hideOnFocus(id) {
      this.close(id);
    },

    handleKeydown(id, event) {
      if (event.key === "Escape" && this.isOpen(id)) {
        event.preventDefault();
        this.close(id);
      }
    },

    refreshPosition(id) {
      const instance = this.instances[id];
      if (instance) {
        scheduleRefresh(instance);
      }
    },

    tooltipStyle(id) {
      const position = this.getPosition(id);
      return {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
      };
    },

    destroy() {
      for (const id of Object.keys(this.instances)) {
        this.unregister(id);
      }
    },
  };

  return store;
}
