import { type MapStore, map } from "nanostores";
import type {
  FetchStatus,
  MutationState,
  MutationStatus,
  QueryState,
  QueryStatus,
} from "./types.js";

export type QueryStateRecord<TData = unknown> = {
  data: TData | undefined;
  error: Error | null;
  status: QueryStatus;
  fetchStatus: FetchStatus;
  dataUpdatedAt: number;
  errorUpdatedAt: number;
};

export type MutationStateRecord<TData = unknown> = {
  data: TData | undefined;
  error: Error | null;
  status: MutationStatus;
};

export type QueryStateStore<TData = unknown> = {
  $state: MapStore<QueryStateRecord<TData>>;
  state: QueryState<TData>;
};

export type MutationStateStore<TData = unknown, TVariables = void> = {
  $state: MapStore<MutationStateRecord<TData>>;
  state: MutationState<TData, TVariables>;
};

export function attachQueryFlags<TData>(state: QueryState<TData>, staleTime: number): void {
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

export function attachMutationFlags<TData, TVariables>(
  mutation: MutationState<TData, TVariables>
): void {
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

export function createQueryStateStore<TData>(
  initial: QueryStateRecord<TData>,
  staleTime: number,
  refetch: () => Promise<void>
): QueryStateStore<TData> {
  const $state = map(initial);

  const state = {
    get data() {
      return $state.get().data;
    },
    get error() {
      return $state.get().error;
    },
    get status() {
      return $state.get().status;
    },
    get fetchStatus() {
      return $state.get().fetchStatus;
    },
    get dataUpdatedAt() {
      return $state.get().dataUpdatedAt;
    },
    get errorUpdatedAt() {
      return $state.get().errorUpdatedAt;
    },
    refetch,
  } as QueryState<TData>;

  attachQueryFlags(state, staleTime);

  return { $state, state };
}

export function patchQueryState<TData>(
  $state: MapStore<QueryStateRecord<TData>>,
  patch: Partial<QueryStateRecord<TData>>
): void {
  const current = $state.get();

  for (const [key, value] of Object.entries(patch) as [
    keyof QueryStateRecord<TData>,
    QueryStateRecord<TData>[keyof QueryStateRecord<TData>],
  ][]) {
    if (current[key] !== value) {
      $state.setKey(key, value);
    }
  }
}

export function createMutationStateStore<TData, TVariables>(
  handlers: Pick<MutationState<TData, TVariables>, "mutate" | "reset">
): MutationStateStore<TData, TVariables> {
  const $state = map<MutationStateRecord<TData>>({
    data: undefined,
    error: null,
    status: "idle",
  });

  const state = {
    get data() {
      return $state.get().data;
    },
    get error() {
      return $state.get().error;
    },
    get status() {
      return $state.get().status;
    },
    mutate: handlers.mutate,
    reset: handlers.reset,
  } as MutationState<TData, TVariables>;

  attachMutationFlags(state);

  return { $state, state };
}

export function patchMutationState<TData>(
  $state: MapStore<MutationStateRecord<TData>>,
  patch: Partial<MutationStateRecord<TData>>
): void {
  const current = $state.get();

  for (const [key, value] of Object.entries(patch) as [
    keyof MutationStateRecord<TData>,
    MutationStateRecord<TData>[keyof MutationStateRecord<TData>],
  ][]) {
    if (current[key] !== value) {
      $state.setKey(key, value);
    }
  }
}
