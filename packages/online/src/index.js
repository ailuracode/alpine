/**
 * @typedef {Object} OnlineMagic
 * @property {boolean} isOnline Whether the browser reports a network connection.
 */

/**
 * Alpine.js online plugin. Registers reactive magic `$online`.
 *
 * @param {import('alpinejs').Alpine} Alpine
 */
export default function onlinePlugin(Alpine) {
  /** @type {OnlineMagic} */
  const state = Alpine.reactive({ isOnline: navigator.onLine });

  Alpine.magic("online", () => state);

  const update = () => {
    state.isOnline = navigator.onLine;
  };

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
}
