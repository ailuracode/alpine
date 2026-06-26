import type { ToastDuration, ToastItem, ToastPayload, ToastPosition, ToastStore } from "./types.js";

export interface CreateToastStoreOptions<TPositions extends readonly string[] = readonly []> {
  defaultPosition?: ToastPosition<TPositions>;
  /** Declared positions — each gets its own stack. */
  positions?: TPositions;
  defaultDuration?: number;
  maxToasts?: number;
  maxVisible?: number;
  /** Reactive store accessor — required for Alpine auto-dismiss timers. */
  getStore?: () => ToastStore<readonly [], TPositions, unknown>;
}

export function resolveToastLimits(options: { maxToasts?: number; maxVisible?: number } = {}): {
  maxToasts: number;
  maxVisible: number;
} {
  const maxToasts = options.maxToasts ?? 5;
  let maxVisible = options.maxVisible ?? maxToasts;

  if (maxToasts > 0 && maxVisible > maxToasts) {
    maxVisible = maxToasts;
  }

  return { maxToasts, maxVisible };
}

/** Unique stack keys: built-in default plus configured positions. */
export function resolveStackPositions<TPositions extends readonly string[]>(
  defaultPosition: ToastPosition<TPositions>,
  positions?: TPositions
): readonly ToastPosition<TPositions>[] {
  const stacks: ToastPosition<TPositions>[] = [defaultPosition];

  for (const position of positions ?? []) {
    if (!stacks.includes(position as ToastPosition<TPositions>)) {
      stacks.push(position as ToastPosition<TPositions>);
    }
  }

  return stacks;
}

function createToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Canonical persistent value — `0` is normalized to `false`. */
export function normalizeToastDuration(duration: ToastDuration): ToastDuration {
  if (duration === 0) {
    return false;
  }

  return duration;
}

/** Resolves payload duration — `false` / `0` persist; `undefined` uses the default. */
export function resolveToastDuration(
  duration: ToastDuration | undefined,
  defaultDuration: number
): ToastDuration {
  if (duration === undefined) {
    return normalizeToastDuration(defaultDuration);
  }

  return normalizeToastDuration(duration);
}

/** Whether the toast should schedule an auto-dismiss timer. */
export function shouldAutoDismiss(duration: ToastDuration): duration is number {
  return typeof duration === "number" && duration > 0 && Number.isFinite(duration);
}

/** Persistent toasts (`duration: false` / `0`) use a separate UI stack from timed toasts. */
export function isPersistentDuration(duration: ToastDuration): boolean {
  return !shouldAutoDismiss(duration);
}

/**
 * Timed duration for `$toast.promise` loading state.
 * Stays in the timed stack; the timer is replaced when the promise settles.
 */
export const PROMISE_LOADING_DURATION = 3_600_000;

function itemsAtPosition<
  TVariants extends readonly string[],
  TPositions extends readonly string[],
  TContent = unknown,
>(
  items: ToastItem<TVariants, TPositions, TContent>[],
  position: ToastPosition<TPositions>
): ToastItem<TVariants, TPositions, TContent>[] {
  return items.filter((item) => item.position === position);
}

function timedStackAt<
  TVariants extends readonly string[],
  TPositions extends readonly string[],
  TContent = unknown,
>(
  items: ToastItem<TVariants, TPositions, TContent>[],
  position: ToastPosition<TPositions>
): ToastItem<TVariants, TPositions, TContent>[] {
  return itemsAtPosition(items, position).filter((item) => shouldAutoDismiss(item.duration));
}

function persistentStackAt<
  TVariants extends readonly string[],
  TPositions extends readonly string[],
  TContent = unknown,
>(
  items: ToastItem<TVariants, TPositions, TContent>[],
  position: ToastPosition<TPositions>
): ToastItem<TVariants, TPositions, TContent>[] {
  return itemsAtPosition(items, position).filter((item) => isPersistentDuration(item.duration));
}

function enforcePositionLimit<
  TVariants extends readonly string[],
  TPositions extends readonly string[],
  TContent = unknown,
>(
  items: ToastItem<TVariants, TPositions, TContent>[],
  position: ToastPosition<TPositions>,
  maxToasts: number,
  dismissMany: (ids: string[]) => void,
  stack: "timed" | "persistent"
): void {
  if (maxToasts <= 0) {
    return;
  }

  const stackAtPosition =
    stack === "persistent" ? persistentStackAt(items, position) : timedStackAt(items, position);
  const activeAtPosition = stackAtPosition.filter((item) => !item.removed);
  const overflowIds = activeAtPosition.slice(maxToasts).map((item) => item.id);

  dismissMany(overflowIds);
}

function applyToastPatch<TPositions extends readonly string[], TContent = unknown>(
  item: ToastItem<readonly [], TPositions, TContent>,
  payload: Partial<ToastPayload<readonly [], TPositions, TContent>>
): ToastItem<readonly [], TPositions, TContent> {
  const next = { ...item };

  for (const [key, value] of Object.entries(payload) as [
    keyof ToastPayload<readonly [], TPositions, TContent>,
    ToastPayload<readonly [], TPositions, TContent>[keyof ToastPayload<
      readonly [],
      TPositions,
      TContent
    >],
  ][]) {
    if (value !== undefined) {
      if (key === "duration") {
        Object.assign(next, { duration: normalizeToastDuration(value as ToastDuration) });
      } else {
        Object.assign(next, { [key]: value });
      }
    }
  }

  return next;
}

/** Creates the internal reactive toast queue consumed by `$toast` and UI integrators. */
export function createToastStore<
  const TPositions extends readonly string[] = readonly [],
  TContent = unknown,
>(
  options: CreateToastStoreOptions<TPositions> = {}
): ToastStore<readonly [], TPositions, TContent> {
  const defaultPosition = options.defaultPosition ?? "bottom-right";
  const stackPositions = resolveStackPositions(defaultPosition, options.positions);
  const defaultDuration = options.defaultDuration ?? 4000;
  const { maxToasts, maxVisible } = resolveToastLimits(options);
  const dismissDelayMs = 400;
  const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const purgeTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const getStore = options.getStore;

  const store: ToastStore<readonly [], TPositions, TContent> = {
    defaultPosition,
    stackPositions,
    maxToasts,
    maxVisible,
    items: [],

    itemsAt(position) {
      return itemsAtPosition(this.items, position);
    },

    timedItemsAt(position) {
      return timedStackAt(this.items, position);
    },

    persistentItemsAt(position) {
      return persistentStackAt(this.items, position);
    },

    activeTimedItemsAt(position) {
      return this.timedItemsAt(position).filter((item) => !item.removed);
    },

    activePersistentItemsAt(position) {
      return this.persistentItemsAt(position).filter((item) => !item.removed);
    },

    isVisibleAt(position, index) {
      const stack = this.timedItemsAt(position);
      const item = stack[index];

      if (!item || item.removed) {
        return false;
      }

      if (this.maxVisible <= 0) {
        return true;
      }

      let rank = 0;

      for (let i = 0; i <= index; i++) {
        if (stack[i] && !stack[i].removed) {
          rank++;
        }
      }

      return rank <= this.maxVisible;
    },

    push(payload: ToastPayload<readonly [], TPositions, TContent> = {}) {
      const position = payload.position ?? this.defaultPosition;
      const id = createToastId();
      const toast: ToastItem<readonly [], TPositions, TContent> = {
        id,
        key: payload.key ?? null,
        content: payload.content ?? null,
        title: payload.title ?? null,
        description: payload.description ?? null,
        variant: payload.variant ?? "default",
        position,
        duration: resolveToastDuration(payload.duration, defaultDuration),
        action: payload.action ?? null,
        removed: false,
      };

      this.items = [toast, ...this.items];
      enforcePositionLimit(
        this.items,
        position,
        this.maxToasts,
        (ids) => markRemoved(ids),
        shouldAutoDismiss(toast.duration) ? "timed" : "persistent"
      );
      scheduleDismiss(id, toast.duration);

      return id;
    },

    pushUnique(key, payload: ToastPayload<readonly [], TPositions, TContent> = {}) {
      const activeIds = this.items
        .filter((item) => !item.removed && item.key === key)
        .map((item) => item.id);

      markRemoved(activeIds);

      return this.push({ ...payload, key });
    },

    update(id, payload: Partial<ToastPayload<readonly [], TPositions, TContent>> = {}) {
      const current = this.items.find((toast) => toast.id === id);
      if (!current) {
        return;
      }

      const previousPosition = current.position;
      const wasPersistent = isPersistentDuration(current.duration);

      this.items = this.items.map((item) =>
        item.id === id ? applyToastPatch(item, payload) : item
      );

      const updated = this.items.find((toast) => toast.id === id);
      if (!updated) {
        return;
      }

      const nextPosition = updated.position;
      const isNowPersistent = isPersistentDuration(updated.duration);
      const durationStackChanged =
        payload.duration !== undefined && wasPersistent !== isNowPersistent;
      const positionChanged = nextPosition !== previousPosition;

      if (positionChanged) {
        enforcePositionLimit(
          this.items,
          previousPosition,
          this.maxToasts,
          (ids) => markRemoved(ids),
          "timed"
        );
        enforcePositionLimit(
          this.items,
          previousPosition,
          this.maxToasts,
          (ids) => markRemoved(ids),
          "persistent"
        );
      }

      if (positionChanged || durationStackChanged) {
        enforcePositionLimit(
          this.items,
          nextPosition,
          this.maxToasts,
          (ids) => markRemoved(ids),
          "timed"
        );
        enforcePositionLimit(
          this.items,
          nextPosition,
          this.maxToasts,
          (ids) => markRemoved(ids),
          "persistent"
        );
      }

      if (payload.duration !== undefined) {
        scheduleDismiss(id, updated.duration);
      }
    },

    dismiss(id) {
      markRemoved([id]);
    },

    dismissAt(position) {
      const ids = this.itemsAt(position)
        .filter((item) => !item.removed)
        .map((item) => item.id);

      markRemoved(ids);
    },

    dismissAll() {
      const ids = this.items.filter((item) => !item.removed).map((item) => item.id);

      markRemoved(ids);
    },

    destroy() {
      for (const timer of dismissTimers.values()) {
        clearTimeout(timer);
      }

      dismissTimers.clear();

      for (const timer of purgeTimers.values()) {
        clearTimeout(timer);
      }

      purgeTimers.clear();
    },
  };

  function clearDismissTimer(id: string): void {
    const timer = dismissTimers.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      dismissTimers.delete(id);
    }
  }

  function markRemoved(ids: string[]): void {
    if (ids.length === 0) {
      return;
    }

    const activeStore = getStore?.() ?? store;
    const idsToRemove: string[] = [];

    for (const id of ids) {
      const toast = activeStore.items.find((item) => item.id === id);

      if (!toast || toast.removed) {
        continue;
      }

      clearDismissTimer(id);
      idsToRemove.push(id);
    }

    if (idsToRemove.length === 0) {
      return;
    }

    const removeSet = new Set(idsToRemove);

    activeStore.items = activeStore.items.map((item) =>
      removeSet.has(item.id) ? { ...item, removed: true } : item
    );

    const batchId = createToastId();

    const timer = setTimeout(() => {
      purgeTimers.delete(batchId);
      const storeForFilter = getStore?.() ?? store;
      storeForFilter.items = storeForFilter.items.filter((item) => !removeSet.has(item.id));
    }, dismissDelayMs);

    purgeTimers.set(batchId, timer);
  }

  function scheduleDismiss(id: string, duration: ToastDuration): void {
    clearDismissTimer(id);

    // Promise loading uses a sentinel duration — settled via `update`, not a timer.
    if (duration === PROMISE_LOADING_DURATION) {
      return;
    }

    if (shouldAutoDismiss(duration)) {
      const timer = setTimeout(() => {
        dismissTimers.delete(id);
        (getStore?.() ?? store).dismiss(id);
      }, duration);
      dismissTimers.set(id, timer);
    }
  }

  return store;
}
