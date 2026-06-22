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

export default function touchPlugin(Alpine) {
  const state = Alpine.reactive(readTouchState());

  Alpine.magic("touch", () => state);

  const update = () => Object.assign(state, readTouchState());

  window.matchMedia("(pointer: coarse)").addEventListener("change", update);
  window.matchMedia("(pointer: fine)").addEventListener("change", update);
  window.matchMedia("(hover: hover)").addEventListener("change", update);
}
