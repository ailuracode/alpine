import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleRoot = join(__dirname, "..");
const repoDocs = join(exampleRoot, "..", "docs");
const contentDocs = join(exampleRoot, "src", "content", "docs");
const pluginsDir = join(contentDocs, "plugins");

/** Docs that stay at the content root (guides), not under plugins/. */
const GUIDE_SLUGS = new Set([
  "getting-started",
  "architecture",
  "contributing",
  "core",
  "query",
  "query-devtools",
]);

function parseTitle(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "Untitled";
}

function parseDescription(body, title) {
  const lines = body.split("\n");
  let afterTitle = false;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      afterTitle = true;
      continue;
    }
    if (!afterTitle) {
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const text = trimmed.replace(/\*\*/g, "").replace(/`/g, "");
    if (text.length > 0) {
      return text.length > 160 ? `${text.slice(0, 157)}…` : text;
    }
  }

  return `${title} — @ailuracode Alpine.js plugin documentation.`;
}

function toFrontmatter({ title, description }) {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;
}

async function syncFile(filename) {
  const slug = filename.replace(/\.md$/, "");
  const source = await readFile(join(repoDocs, filename), "utf8");
  const title = parseTitle(source);
  const description = parseDescription(source, title);
  const output = toFrontmatter({ title, description }) + source;

  const targetDir = GUIDE_SLUGS.has(slug) ? contentDocs : pluginsDir;
  await writeFile(join(targetDir, filename), output, "utf8");
}

async function main() {
  await rm(pluginsDir, { recursive: true, force: true });
  await mkdir(pluginsDir, { recursive: true });

  const files = (await readdir(repoDocs)).filter((name) => name.endsWith(".md"));
  await Promise.all(files.map(syncFile));

  process.stdout.write(`Synced ${files.length} docs from ${repoDocs} → ${contentDocs}\n`);
}

await main();
