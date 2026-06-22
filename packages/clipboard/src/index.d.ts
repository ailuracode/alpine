export type ClipboardMagic = (text: string) => Promise<void>;

declare function clipboardPlugin(Alpine: Alpine.Alpine): void;

export default clipboardPlugin;

declare namespace Alpine {
  interface Magics<T> {
    $clipboard: ClipboardMagic;
  }
}
