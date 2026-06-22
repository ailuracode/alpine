/** @typedef {'up' | 'down' | 'none'} ScrollDirection */
/** @typedef {ScrollBehavior} ScrollToBehavior */

/**
 * @typedef {Object} ScrollSnapshot
 * @property {number} x Horizontal scroll offset (`window.scrollX`).
 * @property {number} y Vertical scroll offset (`window.scrollY`).
 * @property {ScrollDirection} direction Scroll direction since the last update.
 * @property {boolean} atTop Whether the viewport is at the top of the page.
 * @property {boolean} atBottom Whether the viewport is at the bottom of the page.
 * @property {number} progress Vertical scroll progress from 0 to 100.
 */

/**
 * @typedef {ScrollSnapshot & Object} ScrollStore
 * @property {boolean} locked Whether body scroll is locked.
 * @property {() => boolean} refresh Sync state from the viewport; returns whether anything changed.
 * @property {() => boolean} lock Increment lock count and freeze body scroll.
 * @property {() => boolean} unlock Decrement lock count and restore scroll when count reaches zero.
 * @property {() => boolean} toggleLock Toggle body scroll lock.
 * @property {boolean} isLocked Alias for `locked`.
 * @property {boolean} isAtTop Alias for `atTop`.
 * @property {boolean} isAtBottom Alias for `atBottom`.
 * @property {boolean} isScrollingDown Whether `direction` is `down`.
 * @property {boolean} isScrollingUp Whether `direction` is `up`.
 * @property {boolean} showToTop Whether a "back to top" control should be visible.
 * @property {(behavior?: ScrollToBehavior) => void} toTop Scroll to the top unless locked.
 * @property {(behavior?: ScrollToBehavior) => void} toBottom Scroll to the bottom unless locked.
 */

let savedScrollY = 0;
let lockCount = 0;

/**
 * @param {number} previousY
 * @returns {ScrollSnapshot}
 */
function readScrollState(previousY) {
  const x = window.scrollX;
  const y = window.scrollY;
  const maxY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

  return {
    x,
    y,
    direction: y > previousY ? "down" : y < previousY ? "up" : "none",
    atTop: y <= 0,
    atBottom: y >= maxY - 1,
    progress: maxY > 0 ? Math.round((y / maxY) * 100) : 0,
  };
}

function applyLock() {
  savedScrollY = window.scrollY;
  document.documentElement.classList.add("scroll-locked");
  document.body.classList.add("scroll-locked");
  document.body.style.top = `-${savedScrollY}px`;
}

function removeLock() {
  document.documentElement.classList.remove("scroll-locked");
  document.body.classList.remove("scroll-locked");
  document.body.style.top = "";
  window.scrollTo(0, savedScrollY);
}

/**
 * Alpine.js scroll plugin. Registers `$store.scroll`.
 *
 * @param {import('alpinejs').Alpine} Alpine
 */
export default function scrollPlugin(Alpine) {
  Alpine.store("scroll", {
    x: 0,
    y: 0,
    direction: "none",
    atTop: true,
    atBottom: false,
    progress: 0,
    locked: false,

    /** @returns {boolean} */
    refresh() {
      const next = readScrollState(this.y);
      const unchanged =
        this.x === next.x &&
        this.y === next.y &&
        this.direction === next.direction &&
        this.atTop === next.atTop &&
        this.atBottom === next.atBottom &&
        this.progress === next.progress;

      if (unchanged) {
        return false;
      }

      Object.assign(this, next);
      return true;
    },

    /** @returns {boolean} */
    lock() {
      if (lockCount === 0) {
        applyLock();
        this.locked = true;
      }

      lockCount++;
      return this.locked;
    },

    /** @returns {boolean} */
    unlock() {
      if (lockCount === 0) {
        return this.locked;
      }

      lockCount--;

      if (lockCount === 0) {
        removeLock();
        this.locked = false;
        this.refresh();
      }

      return this.locked;
    },

    /** @returns {boolean} */
    toggleLock() {
      return this.locked ? this.unlock() : this.lock();
    },

    get isLocked() {
      return this.locked;
    },

    get isAtTop() {
      return this.atTop;
    },

    get isAtBottom() {
      return this.atBottom;
    },

    get isScrollingDown() {
      return this.direction === "down";
    },

    get isScrollingUp() {
      return this.direction === "up";
    },

    get showToTop() {
      return !(this.atTop || this.locked);
    },

    /** @param {ScrollToBehavior} [behavior='smooth'] */
    toTop(behavior = "smooth") {
      if (this.locked) {
        return;
      }
      window.scrollTo({ top: 0, behavior });
    },

    /** @param {ScrollToBehavior} [behavior='smooth'] */
    toBottom(behavior = "smooth") {
      if (this.locked) {
        return;
      }
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior,
      });
    },
  });

  const store = Alpine.store("scroll");
  let ticking = false;

  function scheduleRefresh() {
    if (ticking || store.locked) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      store.refresh();
      ticking = false;
    });
  }

  store.refresh();
  window.addEventListener("scroll", scheduleRefresh, { passive: true });
  window.addEventListener("resize", scheduleRefresh, { passive: true });
}
