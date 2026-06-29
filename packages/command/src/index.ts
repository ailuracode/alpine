import type AlpineType from "alpinejs";
import { type CommandStore, type CommandStoreConfig, createCommandStore } from "./store.js";

export {
  type CommandAction,
  type CommandItem,
  type CommandStore,
  type CommandStoreConfig,
  createCommandStore,
} from "./store.js";

export interface CommandPluginOptions extends CommandStoreConfig {}

/** Builds typed command plugin options. */
export function commandOptions<const T extends CommandPluginOptions>(options: T): T {
  return options;
}

/** Alpine.js command palette plugin. Registers `$store.command`. */
export default function commandPlugin(
  options: CommandPluginOptions = {}
): AlpineType.PluginCallback {
  return function registerCommand(Alpine) {
    const store = createCommandStore(options);
    Alpine.store("command", store);
    Alpine.magic("command", () => Alpine.store("command"));
  };
}

declare global {
  namespace Alpine {
    interface Stores {
      command: CommandStore;
    }
    interface Magics<T> {
      $command: CommandStore;
    }
  }
}
