import type AlpineType from "alpinejs";
import { resolveToastPluginConfig } from "./config.js";
import { createToastMagic } from "./magic.js";
import { createToastStore } from "./store.js";
import type { ToastEventPayload, ToastPluginOptions, ToastStore, ToastStoreKey } from "./types.js";

export {
  resolveToastPluginConfig,
  toastOptions,
  toastPositions,
  toastVariants,
} from "./config.js";
export { createToastMagic, RESERVED_TOAST_MAGIC_KEYS } from "./magic.js";
export {
  createToastStore,
  isPersistentDuration,
  normalizeToastDuration,
  PROMISE_LOADING_DURATION,
  resolveStackPositions,
  resolveToastDuration,
  resolveToastLimits,
  shouldAutoDismiss,
} from "./store.js";
export type {
  DefaultToastPosition,
  DefaultToastVariant,
  ResolvedPromiseConfig,
  ResolvedToastPluginConfig,
  ToastAction,
  ToastDuration,
  ToastEventPayload,
  ToastItem,
  ToastMagic,
  ToastPayload,
  ToastPayloadWithoutVariant,
  ToastPluginOptions,
  ToastPosition,
  ToastPromiseInput,
  ToastPromiseMessages,
  ToastPromiseOptions,
  ToastStore,
  ToastStoreKey,
  ToastVariant,
  ToastVariantMethods,
} from "./types.js";

export { TOAST_STORE_KEY } from "./types.js";

function registerAlpineToastStore<TPositions extends readonly string[], TContent>(
  Alpine: AlpineType.Alpine,
  storeKey: ToastStoreKey,
  store: ToastStore<readonly [], TPositions, TContent>
): void {
  const registerStore = Alpine.store as (name: ToastStoreKey, value: unknown) => void;
  registerStore(storeKey, store);
}

function getToastStore<
  TVariants extends readonly string[],
  TPositions extends readonly string[],
  TContent,
>(Alpine: AlpineType.Alpine, storeKey: ToastStoreKey): ToastStore<TVariants, TPositions, TContent> {
  return Alpine.store(storeKey) as unknown as ToastStore<TVariants, TPositions, TContent>;
}

function registerToastPlugin<
  TVariants extends readonly string[],
  TPositions extends readonly string[] = readonly [],
  TContent = unknown,
>(
  Alpine: AlpineType.Alpine,
  options: ToastPluginOptions<TVariants, TPositions, TContent> = {} as ToastPluginOptions<
    TVariants,
    TPositions,
    TContent
  >
): void {
  const config = resolveToastPluginConfig(options);
  let reactiveStore: ToastStore<TVariants, TPositions, TContent> | undefined;
  let windowEventsAbort: AbortController | undefined;

  const store = createToastStore<TPositions, TContent>({
    defaultPosition: config.defaultPosition,
    positions: config.positions,
    defaultDuration: config.defaultDuration,
    maxToasts: config.maxToasts,
    maxVisible: config.maxVisible,
    getStore: (): ToastStore<readonly [], TPositions, TContent> =>
      (reactiveStore ?? store) as ToastStore<readonly [], TPositions, TContent>,
  });

  const baseDestroy = store.destroy.bind(store);

  store.destroy = () => {
    windowEventsAbort?.abort();
    windowEventsAbort = undefined;
    baseDestroy();
  };

  registerAlpineToastStore<TPositions, TContent>(Alpine, config.storeKey, store);
  reactiveStore = getToastStore<TVariants, TPositions, TContent>(Alpine, config.storeKey);
  const toast = createToastMagic(config, () =>
    getToastStore<TVariants, TPositions, TContent>(Alpine, config.storeKey)
  );
  Alpine.magic("toast", () => toast);

  if (config.listenToWindowEvents && typeof window !== "undefined") {
    windowEventsAbort = new AbortController();

    window.addEventListener(
      "toast",
      (event) => {
        if (event instanceof CustomEvent) {
          toast.fromPayload(
            (event.detail ?? {}) as ToastEventPayload<TVariants, TPositions, TContent>
          );
        }
      },
      { signal: windowEventsAbort.signal }
    );
  }
}

/** Alpine.js toast plugin. Registers magic `$toast` with an internal reactive queue. CSS-framework agnostic — no markup or styles. */
export default function toastPlugin<
  const TVariants extends readonly string[] = readonly [],
  const TPositions extends readonly string[] = readonly [],
  TContent = unknown,
>(
  optionsOrAlpine?: ToastPluginOptions<TVariants, TPositions, TContent> | AlpineType.Alpine
): undefined | ((Alpine: AlpineType.Alpine) => void) {
  if (optionsOrAlpine && typeof (optionsOrAlpine as AlpineType.Alpine).magic === "function") {
    registerToastPlugin(optionsOrAlpine as AlpineType.Alpine, {});
    return;
  }

  const options =
    (optionsOrAlpine as ToastPluginOptions<TVariants, TPositions, TContent> | undefined) ?? {};

  return (Alpine: AlpineType.Alpine) => {
    registerToastPlugin(Alpine, options);
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      toast: import("./types.js").ToastStore;
    }
    interface Magics<T> {
      $toast: import("./types.js").ToastMagic;
    }
  }
}
