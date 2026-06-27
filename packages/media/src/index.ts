import type AlpineType from "alpinejs";

// ── Types ──────────────────────────────────────────────────────────

export interface ScreenInterval<Name extends string = string> {
  readonly name: Name;
  readonly maxWidth: number;
}

export interface ScreenPluginOptions<Name extends string = string> {
  /** Intervals sorted by maxWidth ascending. Smallest-first check priority. */
  intervals?: readonly ScreenInterval<Name>[];
}

export interface ScreenStore<Name extends string = string> {
  width: number;
  type: Name;
  readonly intervals: readonly ScreenInterval<Name>[];
  is(name: Name): boolean;
  refresh(): boolean;
  refreshWidth(): boolean;
}

export type ScreenSnapshot<Name extends string = string> = {
  readonly width: number;
  readonly type: Name;
};

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_SCREEN_INTERVALS: readonly [
  ScreenInterval<"mobile">,
  ScreenInterval<"desktop">,
] = [
  { name: "mobile", maxWidth: 767 },
  { name: "desktop", maxWidth: Number.POSITIVE_INFINITY },
] as const;

// ── Helpers ────────────────────────────────────────────────────────

/** Asserts literal types on an intervals array for const inference. */
export function screenIntervals<const T extends readonly ScreenInterval[]>(intervals: T): T {
  return intervals;
}

/**
 * Resolves which interval a width falls into (smallest-first priority).
 * Iterates intervals in order; the first whose `maxWidth >= width` wins.
 */
export function resolveScreenType<Name extends string>(
  width: number,
  intervals: readonly ScreenInterval<Name>[]
): Name {
  for (const interval of intervals) {
    if (width <= interval.maxWidth) {
      return interval.name;
    }
  }
  return intervals[intervals.length - 1]?.name;
}

/** Reads a width-based screen snapshot (useful for SSR or testing). */
export function readScreenSnapshot<Name extends string = string>(
  intervals: readonly ScreenInterval<Name>[] = DEFAULT_SCREEN_INTERVALS as unknown as readonly ScreenInterval<Name>[]
): ScreenSnapshot<Name> {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  return {
    width,
    type: resolveScreenType(width, intervals),
  };
}

// ── Internal helpers ───────────────────────────────────────────────

type IntervalQuery<Name extends string> = {
  interval: ScreenInterval<Name>;
  media: MediaQueryList;
};

function createQueries<Name extends string>(
  intervals: readonly ScreenInterval<Name>[]
): IntervalQuery<Name>[] {
  // One query per interval except the last (catch-all fallback)
  return intervals.slice(0, -1).map((interval) => ({
    interval,
    media: window.matchMedia(`(max-width: ${interval.maxWidth}px)`),
  }));
}

function resolveTypeFromQueries<Name extends string>(
  queries: IntervalQuery<Name>[],
  fallback: Name
): Name {
  for (const q of queries) {
    if (q.media.matches) {
      return q.interval.name;
    }
  }
  return fallback;
}

const WIDTH_DEBOUNCE_MS = 100;

// ── Plugin (factory) ───────────────────────────────────────────────

/**
 * Creates the screen plugin from a set of intervals.
 *
 * When you pass `intervals` with `as const`, the interval names are
 * preserved as literal types for full type inference.
 *
 * @example
 * ```ts
 * Alpine.plugin(screen({
 *   intervals: [
 *     { name: "mobile",  maxWidth: 767 },
 *     { name: "desktop", maxWidth: Number.POSITIVE_INFINITY },
 *   ] as const,
 * }));
 * ```
 */
export default function screenPlugin<
  const Intervals extends readonly ScreenInterval[] = typeof DEFAULT_SCREEN_INTERVALS,
>(options: { intervals?: Intervals } = {}): AlpineType.PluginCallback {
  type Name = Intervals[number]["name"];

  const intervals: readonly ScreenInterval<Name>[] = (options.intervals ??
    DEFAULT_SCREEN_INTERVALS) as unknown as readonly ScreenInterval<Name>[];

  return function registerScreen(Alpine) {
    const queries = createQueries(intervals);
    const fallbackName = intervals[intervals.length - 1].name;
    let typeHandler: (() => void) | null = null;
    let widthTimer: ReturnType<typeof setTimeout> | null = null;

    const screenStore: ScreenStore<Name> = {
      width: window.innerWidth,
      type: resolveTypeFromQueries(queries, fallbackName),
      intervals,

      is(name: Name) {
        return this.type === name;
      },

      refresh() {
        const newType = resolveTypeFromQueries(queries, fallbackName);
        const newWidth = window.innerWidth;
        let changed = false;

        if (this.type !== newType) {
          this.type = newType;
          changed = true;
        }
        if (this.width !== newWidth) {
          this.width = newWidth;
          changed = true;
        }
        return changed;
      },

      refreshWidth() {
        const newWidth = window.innerWidth;
        if (this.width !== newWidth) {
          this.width = newWidth;
          return true;
        }
        return false;
      },
    };

    Alpine.store("device", screenStore);
    Alpine.magic("device", () => Alpine.store("device"));

    const device = Alpine.store("device") as ScreenStore<Name>;

    function bindListeners() {
      unbindListeners();
      typeHandler = () => {
        device.refresh();
      };
      for (const q of queries) {
        q.media.addEventListener("change", typeHandler);
      }
      window.addEventListener("resize", scheduleWidthUpdate, { passive: true });
    }

    function unbindListeners() {
      clearTimeout(widthTimer ?? undefined);
      widthTimer = null;
      if (!typeHandler) {
        return;
      }
      for (const q of queries) {
        q.media.removeEventListener("change", typeHandler);
      }
      window.removeEventListener("resize", scheduleWidthUpdate);
      typeHandler = null;
    }

    function scheduleWidthUpdate() {
      clearTimeout(widthTimer ?? undefined);
      widthTimer = setTimeout(() => {
        widthTimer = null;
        device.refreshWidth();
      }, WIDTH_DEBOUNCE_MS);
    }

    bindListeners();
    device.refresh();
  };
}

/**
 * Creates a typed accessor for the device store, preserving literal
 * interval names from your intervals array.
 *
 * Pass the *same* intervals array (with `as const`) so that the
 * returned getter knows the exact set of interval names.
 *
 * @example
 * ```ts
 * const intervals = [
 *   { name: "mobile",  maxWidth: 767 },
 *   { name: "tablet",  maxWidth: 900 },
 *   { name: "desktop", maxWidth: Number.POSITIVE_INFINITY },
 * ] as const;
 *
 * Alpine.plugin(screen({ intervals }));
 *
 * const getDevice = createDeviceAccessor(intervals);
 * const device = getDevice(Alpine);
 * device.type // "mobile" | "tablet" | "desktop"
 * ```
 */
export function createDeviceAccessor<const Intervals extends readonly ScreenInterval[]>(
  _intervals: Intervals
): (alpine: AlpineType.Alpine) => ScreenStore<Intervals[number]["name"]> {
  return (alpine) => alpine.store("device") as unknown as ScreenStore<Intervals[number]["name"]>;
}

declare global {
  namespace Alpine {
    interface Stores {
      device: ScreenStore;
    }
  }
}
