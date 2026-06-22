import { beforeEach, vi } from "vitest";

const mediaListeners = new Map();

function createMediaQueryList(query, matches = false) {
  const listeners = new Set();

  return {
    media: query,
    matches,
    addEventListener(_event, listener) {
      listeners.add(listener);
      mediaListeners.set(query, listeners);
    },
    removeEventListener(_event, listener) {
      listeners.delete(listener);
    },
    dispatch(matches) {
      this.matches = matches;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

const mediaQueries = new Map();

vi.stubGlobal(
  "matchMedia",
  vi.fn((query) => {
    if (!mediaQueries.has(query)) {
      mediaQueries.set(query, createMediaQueryList(query));
    }
    return mediaQueries.get(query);
  })
);

export function setMatchMedia(query, matches) {
  if (!mediaQueries.has(query)) {
    mediaQueries.set(query, createMediaQueryList(query, matches));
    return;
  }

  mediaQueries.get(query).dispatch(matches);
}

export function resetMatchMedia() {
  mediaQueries.clear();
  mediaListeners.clear();
}

beforeEach(() => {
  localStorage.clear();
  resetMatchMedia();
  document.documentElement.innerHTML = "<head></head><body></body>";
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  document.body.className = "";
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
});
