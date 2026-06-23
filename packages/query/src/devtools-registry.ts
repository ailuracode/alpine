import type { QueryEntry } from "./cache-internals.js";
import {
  type DevtoolsListener,
  type MutationDevtoolsEntry,
  type QueryDevtoolsEntry,
  type QueryDevtoolsSnapshot,
  serializeDevtoolsError,
  serializeDevtoolsValue,
} from "./devtools.js";

const MAX_MUTATION_HISTORY = 25;

export class DevtoolsRegistry {
  private readonly listeners = new Set<DevtoolsListener>();
  private readonly mutations: MutationDevtoolsEntry[] = [];
  private mutationCounter = 0;

  subscribe(listener: DevtoolsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  buildSnapshot(entries: Iterable<QueryEntry>): QueryDevtoolsSnapshot {
    return {
      queries: [...entries].map((entry) => this.serializeQuery(entry)),
      mutations: [...this.mutations],
      updatedAt: Date.now(),
    };
  }

  trackMutationStart(variables: unknown): string {
    const id = `mutation-${++this.mutationCounter}`;

    this.mutations.unshift({
      id,
      status: "pending",
      variables: serializeDevtoolsValue(variables),
      data: undefined,
      error: null,
      updatedAt: Date.now(),
    });

    this.trimMutations();
    this.notify();
    return id;
  }

  trackMutationSuccess(id: string, data: unknown): void {
    this.updateMutation(id, {
      status: "success",
      data: serializeDevtoolsValue(data),
      error: null,
    });
  }

  trackMutationError(id: string, error: Error): void {
    this.updateMutation(id, {
      status: "error",
      error: serializeDevtoolsError(error),
    });
  }

  clearMutations(): void {
    this.mutations.length = 0;
    this.notify();
  }

  private serializeQuery(entry: QueryEntry): QueryDevtoolsEntry {
    const { state } = entry;

    return {
      key: [...entry.key],
      keyHash: entry.keyHash,
      status: state.status,
      fetchStatus: state.fetchStatus,
      observers: entry.observers,
      isStale: state.isStale,
      isLoading: state.isLoading,
      isFetching: state.isFetching,
      isError: state.isError,
      isSuccess: state.isSuccess,
      isInvalidated: entry.isInvalidated,
      dataUpdatedAt: state.dataUpdatedAt,
      errorUpdatedAt: state.errorUpdatedAt,
      data: serializeDevtoolsValue(state.data),
      error: serializeDevtoolsError(state.error),
      options: { ...entry.options },
    };
  }

  private updateMutation(id: string, patch: Partial<MutationDevtoolsEntry>): void {
    const mutation = this.mutations.find((item) => item.id === id);
    if (!mutation) {
      return;
    }

    Object.assign(mutation, patch, { updatedAt: Date.now() });
    this.notify();
  }

  private trimMutations(): void {
    if (this.mutations.length > MAX_MUTATION_HISTORY) {
      this.mutations.length = MAX_MUTATION_HISTORY;
    }
  }
}
