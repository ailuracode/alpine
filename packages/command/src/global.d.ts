/// <reference types="@types/alpinejs" />

export type CommandAction = () => void | Promise<void>;

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  keywords?: string[];
  disabled?: boolean;
  action: CommandAction;
};

export interface CommandStore {
  search: string;
  activeIndex: number;
  visible: boolean;
  items: Record<string, CommandItem>;
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  register(item: CommandItem): void;
  unregister(id: string): void;
  run(id: string): Promise<void>;
  handleKeydown(event: KeyboardEvent): void;
  readonly filteredItems: CommandItem[];
  readonly groupedItems: Record<string, CommandItem[]>;
  destroy(): void;
}

export interface CommandPluginOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onRun?: (item: CommandItem) => void;
  filter?: (item: CommandItem, search: string) => boolean;
}

export function commandOptions<const T extends CommandPluginOptions>(options: T): T;
export function createCommandStore(options?: CommandPluginOptions): CommandStore;

export default function commandPlugin(
  options?: CommandPluginOptions
): import("alpinejs").PluginCallback;

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
