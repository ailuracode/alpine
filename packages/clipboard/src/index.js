/**
 * Copies text to the system clipboard. Resolves when the write completes.
 *
 * @typedef {(text: string) => Promise<void>} ClipboardMagic
 */

/**
 * Legacy copy fallback for non-secure contexts without `navigator.clipboard`.
 *
 * @param {Document} doc
 * @returns {boolean}
 */
function copyViaLegacyCommand(doc) {
  const run = Reflect.get(doc, "execCommand");
  return typeof run === "function" && run.call(doc, "copy", false);
}

/**
 * @param {string} text
 * @returns {Promise<void>}
 */
async function writeClipboard(text) {
  const value = String(text);

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  copyViaLegacyCommand(document);
  document.body.removeChild(area);
}

/**
 * Alpine.js clipboard plugin. Registers magic `$clipboard(text)`.
 *
 * @param {import('alpinejs').Alpine} Alpine
 */
export default function clipboardPlugin(Alpine) {
  Alpine.magic("clipboard", () => writeClipboard);
}
