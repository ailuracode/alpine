/// <reference types="@types/alpinejs" />

export declare const CLIPBOARD_COPY_MODES: readonly ["auto", "clipboard", "legacy"];

export type ClipboardCopyMode = (typeof CLIPBOARD_COPY_MODES)[number];

export type ClipboardCopyText = string | number | boolean | bigint;

export type ClipboardCopyOptions<TMode extends ClipboardCopyMode = "auto"> = {
  mode?: TMode;
};

export type CopyToClipboard = {
  (text: ClipboardCopyText): Promise<void>;
  <const TMode extends ClipboardCopyMode>(text: ClipboardCopyText, mode: TMode): Promise<void>;
  <const TMode extends ClipboardCopyMode>(
    text: ClipboardCopyText,
    options: ClipboardCopyOptions<TMode>
  ): Promise<void>;
};

export type ClipboardMagic = CopyToClipboard;

export function clipboardOptions<const TOptions extends ClipboardCopyOptions<ClipboardCopyMode>>(
  options: TOptions
): TOptions;

export declare const copyToClipboard: CopyToClipboard;

declare global {
  namespace Alpine {
    interface Magics<T> {
      $clipboard: ClipboardMagic;
    }
  }
}
