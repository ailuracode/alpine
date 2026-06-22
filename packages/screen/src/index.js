const DEFAULT_MOBILE_MAX = 767;
const DEFAULT_TABLET_MAX = 1023;
const WIDTH_DEBOUNCE_MS = 100;

function createQueries(mobileMax, tabletMax) {
  return {
    mobile: window.matchMedia(`(max-width: ${mobileMax}px)`),
    tablet: window.matchMedia(
      `(min-width: ${mobileMax + 1}px) and (max-width: ${tabletMax}px)`
    ),
  };
}

function resolveType(queries) {
  if (queries.mobile.matches) return "mobile";
  if (queries.tablet.matches) return "tablet";
  return "desktop";
}

function applyType(target, queries) {
  const type = resolveType(queries);
  if (target.type === type) return false;

  target.type = type;
  return true;
}

function applyWidth(target) {
  const width = window.innerWidth;
  if (target.width === width) return false;

  target.width = width;
  return true;
}

export default function screenPlugin(Alpine) {
  let queries = createQueries(DEFAULT_MOBILE_MAX, DEFAULT_TABLET_MAX);
  let typeHandler = null;
  let widthTimer = null;

  Alpine.store("device", {
    mobileMax: DEFAULT_MOBILE_MAX,
    tabletMax: DEFAULT_TABLET_MAX,
    width: window.innerWidth,
    type: "desktop",

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

    setBreakpoints({ mobileMax, tabletMax } = {}) {
      unbindListeners();
      if (mobileMax != null) this.mobileMax = mobileMax;
      if (tabletMax != null) this.tabletMax = tabletMax;
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
    Object.values(queries).forEach((media) => {
      media.addEventListener("change", typeHandler);
    });
    window.addEventListener("resize", scheduleWidthUpdate, { passive: true });
  }

  function unbindListeners() {
    clearTimeout(widthTimer);
    widthTimer = null;

    if (!typeHandler) return;

    Object.values(queries).forEach((media) => {
      media.removeEventListener("change", typeHandler);
    });
    window.removeEventListener("resize", scheduleWidthUpdate);
    typeHandler = null;
  }

  bindListeners();
  store.refresh();
}
