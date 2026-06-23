import type AlpineType from "alpinejs";
import type { MapStore } from "nanostores";
import type { MutationStateRecord, QueryStateRecord } from "./nano-state.js";
import { attachMutationFlags, attachQueryFlags } from "./nano-state.js";
import type { MutationState, QueryState } from "./types.js";

type Reactive = AlpineType.Alpine["reactive"];

function syncRecordToReactive<TRecord extends Record<string, unknown>>(
  target: TRecord,
  record: TRecord
): void {
  for (const key of Object.keys(record) as (keyof TRecord)[]) {
    target[key] = record[key];
  }
}

export function bridgeQueryStateToAlpine<TData>(
  state: QueryState<TData>,
  $state: MapStore<QueryStateRecord<TData>>,
  reactive: Reactive,
  staleTime: number
): QueryState<TData> {
  const bridged = reactive({
    ...$state.get(),
    refetch: state.refetch,
  }) as QueryState<TData>;

  attachQueryFlags(bridged as QueryState<TData>, staleTime);

  $state.subscribe((record) => {
    syncRecordToReactive(bridged as QueryStateRecord<TData>, record);
  });

  return bridged;
}

export function bridgeMutationStateToAlpine<TData, TVariables>(
  state: MutationState<TData, TVariables>,
  $state: MapStore<MutationStateRecord<TData>>,
  reactive: Reactive
): MutationState<TData, TVariables> {
  const bridged = reactive({
    ...$state.get(),
    mutate: state.mutate.bind(state),
    reset: state.reset.bind(state),
  } as MutationState<TData, TVariables>) as MutationState<TData, TVariables>;

  attachMutationFlags(bridged as MutationState<TData, TVariables>);

  $state.subscribe((record) => {
    syncRecordToReactive(bridged as MutationStateRecord<TData>, record);
  });

  return bridged;
}
