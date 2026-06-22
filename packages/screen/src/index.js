/** @typedef {'mobile' | 'tablet' | 'desktop'} DeviceType */

/**
 * @typedef {Object} DeviceBreakpoints
 * @property {number} [mobileMax] Max viewport width (px) treated as mobile.
 * @property {number} [tabletMax] Max viewport width (px) treated as tablet.
 */

/**
 * @typedef {Object} DeviceStore
 * @property {number} mobileMax Upper bound (px) for the mobile breakpoint.
 * @property {number} tabletMax Upper bound (px) for the tablet breakpoint.
 * @property {number} width Current `window.innerWidth`.
 * @property {DeviceType} type Current device category from media queries.
 * @property {(name: DeviceType) => boolean} is Whether `type` matches `name`.
 * @property {boolean} isMobile Whether `type` is `mobile`.
 * @property {boolean} isTablet Whether `type` is `tablet`.
 * @property {boolean} isDesktop Whether `type` is `desktop`.
 * @property {() => void} refreshType Update `type` from media queries.
 * @property {() => void} refreshWidth Update `width` from `window.innerWidth`.
 * @property {() => void} refresh Update both `type` and `width`.
 * @property {(breakpoints?: DeviceBreakpoints) => void} setBreakpoints Rebind media queries with new bounds.
 */

const DEFAULT_MOBILE_MAX = 767;
const DEFAULT_TABLET_MAX = 1023;
const WIDTH_DEBOUNCE_MS = 100;

/**
 * @param {number} mobileMax
 * @param {number} tabletMax
 */
function createQueries(mobileMax, tabletMax) {
  return {
    mobile: window.matchMedia(`(max-width: ${mobileMax}px)`),
    tablet: window.matchMedia(`(min-width: ${mobileMax + 1}px) and (max-width: ${tabletMax}px)`),
  };
}

/**
 * @param {ReturnType<typeof createQueries>} queries
 * @returns {DeviceType}
 */
function resolveType(queries) {
  if (queries.mobile.matches) {
    return "mobile";
  }
  if (queries.tablet.matches) {
    return "tablet";
  }
  return "desktop";
}

/**
 * @param {Pick<DeviceStore, 'type'>} target
 * @param {ReturnType<typeof createQueries>} queries
 * @returns {boolean} Whether `type` changed.
 */
function applyType(target, queries) {
  const type = resolveType(queries);
  if (target.type === type) {
    return false;
  }

  target.type = type;
  return true;
}

/**
 * @param {Pick<DeviceStore, 'width'>} target
 * @returns {boolean} Whether `width` changed.
 */
function applyWidth(target) {
  const width = window.innerWidth;
  if (target.width === width) {
    return false;
  }

  target.width = width;
  return true;
}

/**
 * Alpine.js screen plugin. Registers `$store.device`.
 *
 * @param {import('alpinejs').Alpine} Alpine
 */
export default function screenPlugin(Alpine) {
  let queries = createQueries(DEFAULT_MOBILE_MAX, DEFAULT_TABLET_MAX);
  let typeHandler = null;
  let widthTimer = null;

  Alpine.store("device", {
    mobileMax: DEFAULT_MOBILE_MAX,
    tabletMax: DEFAULT_TABLET_MAX,
    width: window.innerWidth,
    type: "desktop",

    /** @param {DeviceType} name */
    is(name) {
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

    /** @param {DeviceBreakpoints} [breakpoints] */
    setBreakpoints({ mobileMax, tabletMax } = {}) {
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
  });

  const store = Alpine.store("device");

  function scheduleWidthUpdate() {
    clearTimeout(widthTimer);
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
    clearTimeout(widthTimer);
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
