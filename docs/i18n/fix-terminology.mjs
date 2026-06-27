/**
 * Preserve Alpine.js concepts and npm identifiers in translated docs.
 * Run after editing docs/es/ or docs/pt/: node docs/i18n/fix-terminology.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** [pattern, replacement] applied in order per file. */
const REPLACEMENTS = [
  // Section headings — Alpine API surface
  [/## API de la magia/g, "## Magic API"],
  [/## API del store/g, "## Store API"],
  [/## API da store/g, "## Store API"],
  [/## API magic/g, "## Magic API"],
  [/## Magia `/g, "## Magic `"],
  [/## Plugin de Alpine/g, "## Alpine plugin"],
  [/## Plugin Alpine/g, "## Alpine plugin"],
  [/## Adaptador personalizado/g, "## Custom adapter"],
  [/## Adaptador personalizado/g, "## Custom adapter"],
  [/### Adaptador respaldado por store/g, "### Store-backed adapter"],
  [/### Adaptador respaldado por store/g, "### Store-backed adapter"],
  [
    /### Plugin Alpine desde un adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [
    /### Plugin Alpine a partir de um adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [/### Factory de adaptador/g, "### Adapter factory"],
  [/### Factory de adaptador/g, "### Adapter factory"],
  [/## Tipos de plugin/g, "## Plugin kinds"],
  [/## Tipos de plugin/g, "## Plugin kinds"],
  [/## Plugins factory/g, "## Factory plugins"],
  [/## Plugins factory/g, "## Factory plugins"],

  // Labels
  [/Nombre del store:/g, "Store name:"],
  [/Nome da store:/g, "Store name:"],
  [/\| API del store \|/g, "| Store API |"],
  [/\| API da store \|/g, "| Store API |"],
  [/\| Paquete \| Nombre del store \|/g, "| Package | Store name |"],
  [/\| Pacote \| Nome da store \|/g, "| Package | Store name |"],
  [/\| Paquete \| Magic \|/g, "| Package | Magic |"],
  [/\| Pacote \| Magic \|/g, "| Package | Magic |"],
  [/Adaptador nativo con `Alpine\.reactive`/g, "Native `Alpine.reactive` adapter"],
  [/Adaptador nativo com `Alpine\.reactive`/g, "Native `Alpine.reactive` adapter"],
  [/Adaptador vanilla de Zustand/g, "Vanilla Zustand adapter"],
  [/Adaptador vanilla do Zustand/g, "Vanilla Zustand adapter"],

  // Magic in prose (Spanish)
  [/mediante la magia invocable `/g, "mediante el magic invocable `"],
  [/mediante las magias `/g, "mediante los magics "],
  [/mediante la magia `/g, "mediante el magic `"],
  [/Registra la magia invocable `/g, "Registra el magic invocable `"],
  [/Registra la magia `/g, "Registra el magic `"],
  [/la magia invocable `/g, "el magic invocable `"],
  [/no se expone como magia;/g, "no se expone como magic;"],
  [/Magia, no store/g, "Magic, no store"],
  [/Magia de solo lectura/g, "Magic de solo lectura"],
  [/patrón de magia invocable/g, "patrón de magic invocable"],
  [/Magia invocable `/g, "Magic invocable `"],
  [/^Magia invocable /gm, "Magic invocable "],
  [/\| Paquete \| Backend \|/g, "| Package | Backend |"],
  [/\| Pacote \| Backend \|/g, "| Package | Backend |"],
  [/\| Pacote \| Nome do store \| Propósito \|/g, "| Package | Store name | Purpose |"],
  [/\| Package \| Store name \| Propósito \|/g, "| Package | Store name | Purpose |"],
  [/\| Package \| Magic \| Propósito \|/g, "| Package | Magic | Purpose |"],
  [/## API de la instancia/g, "## Instance API"],
  [/## API da instância/g, "## Instance API"],
  [
    /### Plugin Alpine desde un adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [
    /### Alpine plugin desde un adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [
    /### Plugin Alpine a partir de um adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [
    /### Alpine plugin a partir de um adaptador personalizado/g,
    "### Alpine plugin from a custom adapter",
  ],
  [/### Publicar un paquete plugin/g, "### Publishing a plugin package"],
  [/### Publicar um pacote plugin/g, "### Publishing a plugin package"],
  [/## Magic `\$wakelock`/, "## `$wakelock` magic"],
  [/## Magic `\$idle`/, "## `$idle` magic"],
  [/magics \$wakelock`/g, "magics `$wakelock`"],
  [/plugin adaptador de query/g, "query adapter plugin"],
  [/plugins adaptador de query/g, "query adapter plugins"],
  [/el plugin de Alpine/g, "el plugin Alpine"],
  [/plugin de Alpine/g, "plugin Alpine"],

  // Magic in prose (Portuguese)
  [/Registra a magic chamável `/g, "Registra o magic chamável `"],
  [/\ba magic chamável `/g, "o magic chamável `"],
  [/Registra a magic `/g, "Registra o magic `"],
  [/\ba magic `/g, "o magic `"],
  [/via magic `/g, "via magic `"],
  [/padrão similar de magic chamável/g, "padrão similar de magic chamável"],
  [/Magic somente leitura/g, "Magic somente leitura"],
  [/Magic, não store/g, "Magic, no store"],
  [/não se expõe como magic/g, "não se expõe como magic"],
  [/plugin adaptador de query/g, "query adapter plugin"],

  // Package line — keep English label
  [/^Paquete: `/gm, "Package: `"],
  [/^Pacote: `/gm, "Package: `"],

  // Query / adapter technical terms in headings (PT duplicates covered above)
  [/Otros paquetes adaptador:/g, "Other adapter packages:"],
  [/Outros pacotes adaptador:/g, "Other adapter packages:"],
  [/Los adaptadores oficiales/g, "The official adapters"],
  [/Os adaptadores oficiais/g, "The official adapters"],
  [/Exporta el adaptador/g, "Export the adapter"],
  [/Exporte o adaptador/g, "Export the adapter"],
  [/Elige un adaptador/g, "Pick an adapter"],
  [/Escolha um adaptador/g, "Pick an adapter"],
  [/Todo adaptador debe/g, "Every adapter must"],
  [/Todo adaptador deve/g, "Every adapter must"],
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.name.endsWith(".md")) {
      files.push(path);
    }
  }
  return files;
}

async function fixFile(path) {
  let content = await readFile(path, "utf8");
  const original = content;

  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    await writeFile(path, content, "utf8");
    return true;
  }
  return false;
}

async function main() {
  let fixed = 0;
  for (const locale of ["es", "pt"]) {
    const dir = join(repoRoot, locale);
    for (const file of await walk(dir)) {
      if (await fixFile(file)) {
        fixed += 1;
      }
    }
  }
  process.stdout.write(`Fixed terminology in ${fixed} files\n`);
}

await main();
