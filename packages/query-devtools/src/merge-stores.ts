import type {
  MutationDevtoolsEntry,
  QueryDevtoolsApi,
  QueryDevtoolsEntry,
  QueryDevtoolsSnapshot,
  QueryStore,
} from "@ailuracode/alpine-query";

export type QueryDevtoolsEntryView = QueryDevtoolsEntry & {
  adapterName: string;
  entryId: string;
};

export type MutationDevtoolsEntryView = MutationDevtoolsEntry & {
  adapterName: string;
  entryId: string;
};

export type QueryDevtoolsSnapshotView = Omit<QueryDevtoolsSnapshot, "queries" | "mutations"> & {
  queries: QueryDevtoolsEntryView[];
  mutations: MutationDevtoolsEntryView[];
};

export interface MergedQueryDevtools {
  devtools: QueryDevtoolsApi;
  getSnapshotView(): QueryDevtoolsSnapshotView;
  getStoreForQuery(entry: QueryDevtoolsEntryView): QueryStore;
  getStoreForMutation(entry: MutationDevtoolsEntryView): QueryStore;
}

function assertDevtoolsStore(store: QueryStore): void {
  if (!store.devtools) {
    throw new Error(
      "@ailuracode/alpine-query-devtools requires @ailuracode/alpine-query with devtools support"
    );
  }
}

function buildSnapshotView(stores: QueryStore[]): QueryDevtoolsSnapshotView {
  const queries: QueryDevtoolsEntryView[] = [];
  const mutations: MutationDevtoolsEntryView[] = [];
  const adapterNames: string[] = [];

  for (const store of stores) {
    const snapshot = store.devtools.getSnapshot();
    adapterNames.push(snapshot.adapterName);

    for (const query of snapshot.queries) {
      queries.push({
        ...query,
        adapterName: snapshot.adapterName,
        entryId: `${snapshot.adapterName}::${query.keyHash}`,
      });
    }

    for (const mutation of snapshot.mutations) {
      mutations.push({
        ...mutation,
        adapterName: snapshot.adapterName,
        entryId: `${snapshot.adapterName}::${mutation.id}`,
      });
    }
  }

  const uniqueAdapterNames = [...new Set(adapterNames)];

  return {
    adapterName:
      uniqueAdapterNames.length === 1
        ? (uniqueAdapterNames[0] ?? "")
        : uniqueAdapterNames.join(" · "),
    queries,
    mutations,
    updatedAt: Date.now(),
  };
}

export function createMergedQueryDevtools(stores: QueryStore[]): MergedQueryDevtools {
  const validStores = stores.filter((store) => store.devtools);

  if (validStores.length === 0) {
    throw new Error(
      "@ailuracode/alpine-query-devtools requires at least one query store with devtools support"
    );
  }

  for (const store of validStores) {
    assertDevtoolsStore(store);
  }

  const storeByAdapter = new Map<string, QueryStore>();

  for (const store of validStores) {
    storeByAdapter.set(store.devtools.getSnapshot().adapterName, store);
  }

  const getSnapshotView = (): QueryDevtoolsSnapshotView => buildSnapshotView(validStores);

  const devtools: QueryDevtoolsApi = {
    subscribe(listener) {
      const unsubscribes = validStores.map((store) => store.devtools.subscribe(listener));

      return () => {
        for (const unsubscribe of unsubscribes) {
          unsubscribe();
        }
      };
    },
    getSnapshot() {
      return getSnapshotView();
    },
  };

  return {
    devtools,
    getSnapshotView,
    getStoreForQuery(entry) {
      const store = storeByAdapter.get(entry.adapterName);

      if (!store) {
        throw new Error(`No query store registered for adapter "${entry.adapterName}"`);
      }

      return store;
    },
    getStoreForMutation(entry) {
      const store = storeByAdapter.get(entry.adapterName);

      if (!store) {
        throw new Error(`No query store registered for adapter "${entry.adapterName}"`);
      }

      return store;
    },
  };
}

export function resolveQueryDevtoolsStores(options: {
  store?: QueryStore;
  stores?: QueryStore[];
  additionalStores?: QueryStore[];
}): QueryStore[] {
  if (options.stores?.length) {
    return [...new Set(options.stores)];
  }

  const stores = [...(options.store ? [options.store] : []), ...(options.additionalStores ?? [])];
  const uniqueStores = [...new Set(stores)];

  if (uniqueStores.length === 0) {
    throw new Error("@ailuracode/alpine-query-devtools requires at least one query store");
  }

  return uniqueStores;
}
