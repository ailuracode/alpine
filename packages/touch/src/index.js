/**
 * @typedef {Object} TouchSnapshot
 * @property {boolean} isTouch Whether the device supports touch input.
 * @property {boolean} isCoarse Whether the primary pointer is coarse (e.g. finger).
 * @property {boolean} isFine Whether a fine pointer (e.g. mouse) is available.
 * @property {boolean} canHover Whether the primary input can hover.
 * @property {number} maxTouchPoints Maximum simultaneous touch points reported by the browser.
 */

/** @typedef {TouchSnapshot} TouchMagic */

/** @returns {TouchSnapshot} */
function readTouchState() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const hover = window.matchMedia("(hover: hover)").matches;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const hasTouchEvents = "ontouchstart" in window;

  return {
    isTouch: coarse || maxTouchPoints > 0 || hasTouchEvents,
    isCoarse: coarse,
    isFine: window.matchMedia("(pointer: fine)").matches,
    canHover: hover,
    maxTouchPoints,
  };
}

/**
 * Alpine.js touch plugin. Registers reactive magic `$touch`.
 *
 * @param {import('alpinejs').Alpine} Alpine
 */
export default function touchPlugin(Alpine) {
  /** @type {TouchMagic} */
  const state = Alpine.reactive(readTouchState());

  Alpine.magic("touch", () => state);

  const update = () => Object.assign(state, readTouchState());

  window.matchMedia("(pointer: coarse)").addEventListener("change", update);
  window.matchMedia("(pointer: fine)").addEventListener("change", update);
  window.matchMedia("(hover: hover)").addEventListener("change", update);
}
