import type AlpineType from "alpinejs";

export const DEVICE_TYPES = ["mobile", "tablet", "desktop"] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const DEFAULT_DEVICE_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
} as const;

export type DeviceBreakpoints = {
  mobileMax?: number;
  tabletMax?: number;
};

export type DeviceSnapshot = {
  readonly width: number;
  readonly mobileMax: number;
  readonly tabletMax: number;
  readonly type: DeviceType;
};

export interface DeviceStore {
  mobileMax: number;
  tabletMax: number;
  width: number;
  type: DeviceType;
  is(name: DeviceType): boolean;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
  refreshType(): void;
  refreshWidth(): void;
  refresh(): void;
  setBreakpoints(breakpoints?: DeviceBreakpoints): void;
}

const WIDTH_DEBOUNCE_MS = 100;

function resolveBreakpoints(breakpoints: DeviceBreakpoints = DEFAULT_DEVICE_BREAKPOINTS): {
  mobileMax: number;
  tabletMax: number;
} {
  return {
    mobileMax: breakpoints.mobileMax ?? DEFAULT_DEVICE_BREAKPOINTS.mobileMax,
    tabletMax: breakpoints.tabletMax ?? DEFAULT_DEVICE_BREAKPOINTS.tabletMax,
  };
}

/** Builds a typed breakpoints object for `setBreakpoints()`. */
export function deviceBreakpoints<const T extends DeviceBreakpoints>(breakpoints: T): T {
  return breakpoints;
}

/** Resolves device type from viewport width and breakpoint bounds. */
export function resolveDeviceTypeFromWidth(
  width: number,
  breakpoints: DeviceBreakpoints = DEFAULT_DEVICE_BREAKPOINTS
): DeviceType {
  const { mobileMax, tabletMax } = resolveBreakpoints(breakpoints);

  if (width <= mobileMax) {
    return "mobile";
  }

  if (width <= tabletMax) {
    return "tablet";
  }

  return "desktop";
}

/** Reads a width-based device snapshot (store type uses `matchMedia` at runtime). */
export function readDeviceSnapshot(
  breakpoints: DeviceBreakpoints = DEFAULT_DEVICE_BREAKPOINTS
): DeviceSnapshot {
  const resolved = resolveBreakpoints(breakpoints);
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  return {
    width,
    mobileMax: resolved.mobileMax,
    tabletMax: resolved.tabletMax,
    type: resolveDeviceTypeFromWidth(width, resolved),
  };
}

function createQueries(mobileMax: number, tabletMax: number) {
  return {
    mobile: window.matchMedia(`(max-width: ${mobileMax}px)`),
    tablet: window.matchMedia(`(min-width: ${mobileMax + 1}px) and (max-width: ${tabletMax}px)`),
  };
}

type DeviceQueries = ReturnType<typeof createQueries>;

function resolveType(queries: DeviceQueries): DeviceType {
  if (queries.mobile.matches) {
    return "mobile";
  }
  if (queries.tablet.matches) {
    return "tablet";
  }
  return "desktop";
}

function applyType(target: Pick<DeviceStore, "type">, queries: DeviceQueries): boolean {
  const type = resolveType(queries);
  if (target.type === type) {
    return false;
  }

  target.type = type;
  return true;
}

function applyWidth(target: Pick<DeviceStore, "width">): boolean {
  const width = window.innerWidth;
  if (target.width === width) {
    return false;
  }

  target.width = width;
  return true;
}

/** Alpine.js screen plugin. Registers `$store.device`. */
export default function screenPlugin(Alpine: AlpineType.Alpine): void {
  let queries = createQueries(
    DEFAULT_DEVICE_BREAKPOINTS.mobileMax,
    DEFAULT_DEVICE_BREAKPOINTS.tabletMax
  );
  let typeHandler: (() => void) | null = null;
  let widthTimer: ReturnType<typeof setTimeout> | null = null;

  const deviceStore: DeviceStore = {
    mobileMax: DEFAULT_DEVICE_BREAKPOINTS.mobileMax,
    tabletMax: DEFAULT_DEVICE_BREAKPOINTS.tabletMax,
    width: window.innerWidth,
    type: "desktop",

    is(name: DeviceType) {
      return this.type === name;
    },

    get isMobile() {
      return this.type === "mobile";
    },

    get isTablet() {
      return this.type === "tablet";
    },

    get isDesktop() {
      return this.type === "desktop";
    },

    refreshType() {
      applyType(this, queries);
      applyWidth(this);
    },

    refreshWidth() {
      applyWidth(this);
    },

    refresh() {
      applyType(this, queries);
      applyWidth(this);
    },

    setBreakpoints({ mobileMax, tabletMax }: DeviceBreakpoints = {}) {
      unbindListeners();
      if (mobileMax != null) {
        this.mobileMax = mobileMax;
      }
      if (tabletMax != null) {
        this.tabletMax = tabletMax;
      }
      queries = createQueries(this.mobileMax, this.tabletMax);
      bindListeners();
      this.refresh();
    },
  };

  Alpine.store("device", deviceStore);
  const store = Alpine.store("device") as DeviceStore;

  function scheduleWidthUpdate() {
    clearTimeout(widthTimer ?? undefined);
    widthTimer = setTimeout(() => {
      widthTimer = null;
      store.refreshWidth();
    }, WIDTH_DEBOUNCE_MS);
  }

  function bindListeners() {
    unbindListeners();
    typeHandler = () => store.refreshType();
    for (const media of Object.values(queries)) {
      media.addEventListener("change", typeHandler);
    }
    window.addEventListener("resize", scheduleWidthUpdate, { passive: true });
  }

  function unbindListeners() {
    clearTimeout(widthTimer ?? undefined);
    widthTimer = null;

    if (!typeHandler) {
      return;
    }

    for (const media of Object.values(queries)) {
      media.removeEventListener("change", typeHandler);
    }
    window.removeEventListener("resize", scheduleWidthUpdate);
    typeHandler = null;
  }

  bindListeners();
  store.refresh();
}

declare global {
  namespace Alpine {
    interface Stores {
      device: DeviceStore;
    }
  }
}
