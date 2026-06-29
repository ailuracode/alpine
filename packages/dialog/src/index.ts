import type AlpineType from "alpinejs";
import { createDialogStore, type DialogStore } from "./store.js";

export { createFocusTrap, getFocusableElements, restoreFocus } from "./focus.js";
export {
  createDialogStore,
  type DialogInstanceOptions,
  type DialogOpenOptions,
  type DialogStore,
} from "./store.js";

export interface DialogPluginOptions {
  onLockChange?: (locked: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  scrollLock?: boolean;
}

/** Builds typed dialog plugin options. */
export function dialogOptions<const T extends DialogPluginOptions>(options: T): T {
  return options;
}

/** Alpine.js dialog plugin. Registers `$store.dialog`. */
export default function dialogPlugin(options: DialogPluginOptions = {}): AlpineType.PluginCallback {
  return function registerDialog(Alpine) {
    const store = createDialogStore({
      onLockChange: options.onLockChange,
      defaultCloseOnEscape: options.closeOnEscape,
      defaultCloseOnOutsideClick: options.closeOnOutsideClick,
      defaultScrollLock: options.scrollLock,
    });

    Alpine.store("dialog", store);
    Alpine.magic("dialog", () => Alpine.store("dialog"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      dialog: DialogStore;
    }
    interface Magics<T> {
      $dialog: DialogStore;
    }
  }
}
