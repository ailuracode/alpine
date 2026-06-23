import type AlpineType from "alpinejs";
import type { QueryEntry } from "./cache-internals.js";
import { DevtoolsRegistry } from "./devtools-registry.js";
import type {
  FetchStatus,
  MutationOptions,
  MutationState,
  MutationStatus,
  QueryKey,
  QueryOptions,
  QueryState,
  QueryStatus,
} from "./types.js";
import { getRetryDelay, hashKey, matchesQueryKey, resolveQueryOptions } from "./utils.js";

type QueryCacheConfig = {
  defaultQueryOptions: Partial<QueryOptions>;
  defaultMutationRetry: number;
  defaultMutationRetryDelay: number | ((attempt: number) => number);
};

function attachQueryFlags<TData>(state: QueryState<TData>, staleTime: number): void {
  Object.defineProperties(state, {
    isPending: {
      get() {
        return state.status === "pending";
      },
    },
    isLoading: {
      get() {
        return state.status === "pending" && state.fetchStatus === "fetching";
      },
    },
    isFetching: {
      get() {
        return state.fetchStatus === "fetching";
      },
    },
    isError: {
      get() {
        return state.status === "error";
      },
    },
    isSuccess: {
      get() {
        return state.status === "success";
      },
    },
    isStale: {
      get() {
        if (state.dataUpdatedAt === 0) {
          return true;
        }

        return Date.now() - state.dataUpdatedAt > staleTime;
      },
    },
  });
}

function attachMutationFlags<TData, TVariables>(mutation: MutationState<TData, TVariables>): void {
  Object.defineProperties(mutation, {
    isIdle: {
      get() {
        return mutation.status === "idle";
      },
    },
    isPending: {
      get() {
        return mutation.status === "pending";
      },
    },
    isError: {
      get() {
        return mutation.status === "error";
      },
    },
    isSuccess: {
      get() {
        return mutation.status === "success";
      },
    },
  });
}

export class QueryCache {
  private readonly entries = new Map<string, QueryEntry>();
  private readonly config: QueryCacheConfig;
  private readonly reactive: AlpineType.Alpine["reactive"];
  private readonly devtools = new DevtoolsRegistry();
  private focusListenerAttached = false;

  constructor(reactive: AlpineType.Alpine["reactive"], config: QueryCacheConfig) {
    this.reactive = reactive;
    this.config = config;
  }

  getDevtools() {
    return {
      subscribe: (listener: () => void) => this.devtools.subscribe(listener),
      getSnapshot: () => this.devtools.buildSnapshot(this.entries.values()),
    };
  }

  getEntries(): QueryEntry[] {
    return [...this.entries.values()];
  }

  getEntryByHash(keyHash: string): QueryEntry | undefined {
    return this.entries.get(keyHash);
  }

  refetchEntry(keyHash: string): Promise<void> | undefined {
    const entry = this.entries.get(keyHash);
    if (!entry) {
      return undefined;
    }

    return this.fetchEntry(entry, true);
  }

  invalidateEntry(keyHash: string): void {
    const entry = this.entries.get(keyHash);
    if (!entry) {
      return;
    }

    entry.isInvalidated = true;
    if (entry.observers > 0) {
      void this.fetchEntry(entry);
    }

    this.devtools.notify();
  }

  removeEntry(keyHash: string): void {
    const entry = this.entries.get(keyHash);
    if (!entry) {
      return;
    }

    this.clearTimers(entry);
    this.entries.delete(keyHash);
    this.devtools.notify();
  }

  observe<TData>(
    key: QueryKey,
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData>
  ): QueryState<TData> & { destroy(): void } {
    const entry = this.ensureEntry(key, queryFn, options);
    this.subscribe(entry);
    void this.fetchEntry(entry);

    return Object.assign(entry.state, {
      destroy: () => {
        this.unsubscribe(entry);
      },
    });
  }

  fetch<TData>(
    key: QueryKey,
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData>
  ): QueryState<TData> {
    const entry = this.ensureEntry(key, queryFn, options);
    void this.fetchEntry(entry);
    return entry.state;
  }

  get<TData>(key: QueryKey): QueryState<TData> | undefined {
    return this.entries.get(hashKey(key))?.state as QueryState<TData> | undefined;
  }

  async prefetch<TData>(
    key: QueryKey,
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData>
  ): Promise<void> {
    const entry = this.ensureEntry(key, queryFn, options);
    await this.fetchEntry(entry);
  }

  invalidate(key?: QueryKey | QueryKey[]): void {
    const targets = this.resolveTargets(key);

    for (const entry of targets) {
      entry.isInvalidated = true;
      if (entry.observers > 0) {
        void this.fetchEntry(entry);
      }
    }

    this.devtools.notify();
  }

  remove(key?: QueryKey | QueryKey[]): void {
    const targets = this.resolveTargets(key);

    for (const entry of targets) {
      this.clearTimers(entry);
      this.entries.delete(entry.keyHash);
    }

    this.devtools.notify();
  }

  setData<TData>(key: QueryKey, data: TData | ((current: TData | undefined) => TData)): void {
    const entry = this.entries.get(hashKey(key)) as QueryEntry<TData> | undefined;
    if (!entry) {
      return;
    }

    const nextData =
      typeof data === "function"
        ? (data as (current: TData | undefined) => TData)(entry.state.data)
        : data;
    this.applySuccess(entry, nextData);
  }

  cancel(key: QueryKey): void {
    const entry = this.entries.get(hashKey(key));
    if (!entry) {
      return;
    }

    entry.abortController?.abort();
    entry.state.fetchStatus = "idle";
    this.devtools.notify();
  }

  reset(): void {
    for (const entry of this.entries.values()) {
      this.clearTimers(entry);
    }

    this.entries.clear();
    this.devtools.clearMutations();
    this.devtools.notify();
  }

  mutate<TData, TVariables, TContext>(
    options: MutationOptions<TData, TVariables, TContext>
  ): MutationState<TData, TVariables> {
    const mutation = this.reactive({
      data: undefined as TData | undefined,
      error: null as Error | null,
      status: "idle" as MutationStatus,
      mutate: async (variables: TVariables) => {
        mutation.status = "pending";
        mutation.error = null;
        const mutationId = this.devtools.trackMutationStart(variables);

        let context: TContext | undefined;

        try {
          context = await options.onMutate?.(variables);
          const data = await this.runMutationWithRetry(options.mutationFn, variables);
          mutation.data = data;
          mutation.status = "success";
          this.devtools.trackMutationSuccess(mutationId, data);
          options.onSuccess?.(data, variables, context);
          options.onSettled?.(data, null, variables, context);
          return data;
        } catch (error) {
          const mutationError = error instanceof Error ? error : new Error(String(error));
          mutation.error = mutationError;
          mutation.status = "error";
          this.devtools.trackMutationError(mutationId, mutationError);
          options.onError?.(mutationError, variables, context);
          options.onSettled?.(undefined, mutationError, variables, context);
          throw mutationError;
        }
      },
      reset: () => {
        mutation.data = undefined;
        mutation.error = null;
        mutation.status = "idle";
      },
    }) as MutationState<TData, TVariables>;

    attachMutationFlags(mutation);

    return mutation;
  }

  private ensureEntry<TData>(
    key: QueryKey,
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData>
  ): QueryEntry<TData> {
    const keyHash = hashKey(key);
    const resolvedOptions = resolveQueryOptions<TData>(
      options,
      this.config.defaultQueryOptions as Partial<QueryOptions<TData>>
    );

    const existing = this.entries.get(keyHash) as QueryEntry<TData> | undefined;
    if (existing) {
      existing.queryFn = queryFn;
      existing.options = resolvedOptions;
      return existing;
    }

    const hasInitialData = resolvedOptions.initialData !== undefined;
    const baseState = {
      data: resolvedOptions.initialData ?? resolvedOptions.placeholderData,
      error: null as Error | null,
      status: (hasInitialData ? "success" : "pending") as QueryStatus,
      fetchStatus: "idle" as FetchStatus,
      dataUpdatedAt: hasInitialData ? Date.now() : 0,
      errorUpdatedAt: 0,
      refetch: async () => {
        await this.fetchEntry(entry, true);
      },
    };

    const entry = {
      key,
      keyHash,
      queryFn,
      options: resolvedOptions,
      state: baseState as QueryState<TData>,
      observers: 0,
      gcTimeout: null,
      intervalId: null,
      fetchPromise: null,
      abortController: null,
      isInvalidated: false,
    } as QueryEntry<TData>;

    entry.state = this.reactive(baseState) as QueryState<TData>;
    attachQueryFlags(entry.state, resolvedOptions.staleTime);

    this.entries.set(keyHash, entry as QueryEntry);
    this.devtools.notify();
    return entry;
  }

  private subscribe<TData>(entry: QueryEntry<TData>): void {
    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
      entry.gcTimeout = null;
    }

    entry.observers += 1;
    this.ensureFocusListener();
    this.ensureRefetchInterval(entry);
    this.devtools.notify();
  }

  private unsubscribe<TData>(entry: QueryEntry<TData>): void {
    entry.observers = Math.max(0, entry.observers - 1);

    if (entry.observers === 0) {
      this.scheduleGc(entry);
      this.clearRefetchInterval(entry);
    }

    this.devtools.notify();
  }

  private scheduleGc<TData>(entry: QueryEntry<TData>): void {
    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
    }

    entry.gcTimeout = setTimeout(() => {
      if (entry.observers === 0) {
        this.clearTimers(entry);
        this.entries.delete(entry.keyHash);
        this.devtools.notify();
      }
    }, entry.options.gcTime);
  }

  private ensureRefetchInterval<TData>(entry: QueryEntry<TData>): void {
    this.clearRefetchInterval(entry);

    if (!entry.options.refetchInterval || entry.observers === 0) {
      return;
    }

    entry.intervalId = setInterval(() => {
      if (entry.observers > 0 && entry.options.enabled) {
        void this.fetchEntry(entry, true);
      }
    }, entry.options.refetchInterval);
  }

  private clearRefetchInterval<TData>(entry: QueryEntry<TData>): void {
    if (entry.intervalId) {
      clearInterval(entry.intervalId);
      entry.intervalId = null;
    }
  }

  private clearTimers<TData>(entry: QueryEntry<TData>): void {
    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
      entry.gcTimeout = null;
    }

    this.clearRefetchInterval(entry);
    entry.abortController?.abort();
    entry.abortController = null;
    entry.fetchPromise = null;
  }

  private ensureFocusListener(): void {
    if (this.focusListenerAttached || typeof window === "undefined") {
      return;
    }

    const onFocus = () => {
      for (const entry of this.entries.values()) {
        if (
          entry.observers > 0 &&
          entry.options.enabled &&
          entry.options.refetchOnWindowFocus &&
          (entry.isInvalidated || this.isStale(entry))
        ) {
          void this.fetchEntry(entry, true);
        }
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        onFocus();
      }
    });

    this.focusListenerAttached = true;
  }

  private isStale<TData>(entry: QueryEntry<TData>): boolean {
    if (entry.state.dataUpdatedAt === 0) {
      return true;
    }

    return Date.now() - entry.state.dataUpdatedAt > entry.options.staleTime;
  }

  private fetchEntry<TData>(entry: QueryEntry<TData>, force = false): Promise<void> | undefined {
    if (!entry.options.enabled) {
      entry.state.fetchStatus = "paused";
      return;
    }

    if (
      !force &&
      entry.state.status === "success" &&
      !entry.isInvalidated &&
      !this.isStale(entry)
    ) {
      return;
    }

    if (entry.fetchPromise) {
      return entry.fetchPromise;
    }

    entry.state.fetchStatus = "fetching";
    entry.abortController?.abort();
    entry.abortController = new AbortController();
    this.devtools.notify();

    entry.fetchPromise = this.runQuery(entry)
      .catch(() => {
        // Errors are stored on query state.
      })
      .finally(() => {
        entry.fetchPromise = null;
        entry.isInvalidated = false;
        if (entry.state.fetchStatus === "fetching") {
          entry.state.fetchStatus = "idle";
        }
        this.devtools.notify();
      });

    return entry.fetchPromise;
  }

  private async runQuery<TData>(entry: QueryEntry<TData>): Promise<void> {
    const { retry, retryDelay } = entry.options;
    let attempt = 0;

    while (true) {
      try {
        const data = await entry.queryFn();
        this.applySuccess(entry, data);
        return;
      } catch (error) {
        const queryError = error instanceof Error ? error : new Error(String(error));

        if (attempt >= retry) {
          this.applyError(entry, queryError);
          return;
        }

        attempt += 1;
        await this.delay(getRetryDelay(retryDelay, attempt));
      }
    }
  }

  private applySuccess<TData>(entry: QueryEntry<TData>, data: TData): void {
    entry.state.data = data;
    entry.state.error = null;
    entry.state.status = "success";
    entry.state.dataUpdatedAt = Date.now();
    entry.state.errorUpdatedAt = 0;
    entry.state.fetchStatus = "idle";
    this.devtools.notify();
  }

  private applyError<TData>(entry: QueryEntry<TData>, error: Error): void {
    entry.state.error = error;
    entry.state.status = "error";
    entry.state.errorUpdatedAt = Date.now();
    entry.state.fetchStatus = "idle";
    this.devtools.notify();
  }

  private async runMutationWithRetry<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    variables: TVariables
  ): Promise<TData> {
    const { defaultMutationRetry, defaultMutationRetryDelay } = this.config;
    let attempt = 0;

    while (true) {
      try {
        return await mutationFn(variables);
      } catch (error) {
        if (attempt >= defaultMutationRetry) {
          throw error;
        }

        attempt += 1;
        await this.delay(getRetryDelay(defaultMutationRetryDelay, attempt));
      }
    }
  }

  private resolveTargets(key?: QueryKey | QueryKey[]): QueryEntry[] {
    if (key === undefined) {
      return [...this.entries.values()];
    }

    const keys =
      Array.isArray(key) && key.length > 0 && !Array.isArray(key[0])
        ? [key as QueryKey]
        : (key as QueryKey[]);

    if (keys.length === 1 && this.entries.has(hashKey(keys[0]))) {
      const entry = this.entries.get(hashKey(keys[0]));
      return entry ? [entry] : [];
    }

    return [...this.entries.values()].filter((entry) =>
      keys.some((filterKey) => matchesQueryKey(entry.key, filterKey))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
