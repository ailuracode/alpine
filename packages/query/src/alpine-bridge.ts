import type AlpineType from "alpinejs";
import type { MapStore } from "nanostores";
import type { MutationStateRecord, QueryStateRecord } from "./nano-state.js";
import { attachMutationFlags, attachQueryFlags } from "./nano-state.js";
import type { MutationState, QueryState } from "./types.js";

type AlpineInstance = AlpineType.Alpine;

export type AlpineBridge<TState> = {
  state: TState;
  unbind: () => void;
};

function syncRecordToReactive<TRecord extends Record<string, unknown>>(
  target: TRecord,
  record: TRecord
): void {
  for (const key of Object.keys(record) as (keyof TRecord)[]) {
    target[key] = record[key];
  }
}

/** Mirrors the @nanostores/alpine `x-nano` directive bridge (`Alpine.reactive` + `store.listen`). */
export function bridgeQueryStateToAlpine<TData>(
  Alpine: AlpineInstance,
  state: QueryState<TData>,
  $state: MapStore<QueryStateRecord<TData>>,
  staleTime: number
): AlpineBridge<QueryState<TData>> {
  const bridged = Alpine.reactive({
    ...$state.get(),
    refetch: state.refetch,
  }) as QueryState<TData>;

  attachQueryFlags(bridged as QueryState<TData>, staleTime);

  const unbind = $state.listen((record) => {
    syncRecordToReactive(bridged as QueryStateRecord<TData>, record);
  });

  return { state: bridged, unbind };
}

/** Mirrors the @nanostores/alpine `x-nano` directive bridge (`Alpine.reactive` + `store.listen`). */
export function bridgeMutationStateToAlpine<TData, TVariables>(
  Alpine: AlpineInstance,
  state: MutationState<TData, TVariables>,
  $state: MapStore<MutationStateRecord<TData>>
): AlpineBridge<MutationState<TData, TVariables>> {
  const bridged = Alpine.reactive({
    ...$state.get(),
    mutate: state.mutate.bind(state),
    reset: state.reset.bind(state),
  } as MutationState<TData, TVariables>) as MutationState<TData, TVariables>;

  attachMutationFlags(bridged as MutationState<TData, TVariables>);

  const unbind = $state.listen((record) => {
    syncRecordToReactive(bridged as MutationStateRecord<TData>, record);
  });

  return { state: bridged, unbind };
}
