let savedScrollY = 0;
let lockCount = 0;

function readScrollState(previousY) {
  const x = window.scrollX;
  const y = window.scrollY;
  const maxY = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0
  );

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

export default function scrollPlugin(Alpine) {
  Alpine.store("scroll", {
    x: 0,
    y: 0,
    direction: "none",
    atTop: true,
    atBottom: false,
    progress: 0,
    locked: false,

    refresh() {
      const next = readScrollState(this.y);
      const unchanged =
        this.x === next.x &&
        this.y === next.y &&
        this.direction === next.direction &&
        this.atTop === next.atTop &&
        this.atBottom === next.atBottom &&
        this.progress === next.progress;

      if (unchanged) return false;

      Object.assign(this, next);
      return true;
    },

    lock() {
      if (lockCount === 0) {
        applyLock();
        this.locked = true;
      }

      lockCount++;
      return this.locked;
    },

    unlock() {
      if (lockCount === 0) return this.locked;

      lockCount--;

      if (lockCount === 0) {
        removeLock();
        this.locked = false;
        this.refresh();
      }

      return this.locked;
    },

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
      return !this.atTop && !this.locked;
    },

    toTop(behavior = "smooth") {
      if (this.locked) return;
      window.scrollTo({ top: 0, behavior });
    },

    toBottom(behavior = "smooth") {
      if (this.locked) return;
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior,
      });
    },
  });

  const store = Alpine.store("scroll");
  let ticking = false;

  function scheduleRefresh() {
    if (ticking || store.locked) return;
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
