import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { getLocaleDetectScript } from "./src/locale-detect.ts";
import { pluginDocsSidebarItems } from "./src/plugin-nav.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const pkg = (name: string) => path.resolve(root, `../../packages/${name}/src/index.ts`);

const sidebar = [
  {
    label: "Playground",
    translations: { es: "Playground", pt: "Playground" },
    link: "/playground/",
  },
  {
    label: "Guides",
    translations: { es: "Guías", pt: "Guias" },
    items: [
      {
        label: "Getting started",
        translations: { es: "Primeros pasos", pt: "Primeiros passos" },
        link: "/getting-started/",
      },
      {
        label: "Core",
        translations: { es: "Core", pt: "Core" },
        link: "/core/",
      },
      {
        label: "Device detection",
        translations: { es: "Detección de dispositivo", pt: "Detecção de dispositivo" },
        link: "/device-detection/",
      },
    ],
  },
  {
    label: "Essentials",
    translations: { es: "Esenciales", pt: "Essenciais" },
    items: pluginDocsSidebarItems("essential"),
  },
  {
    label: "Extended",
    translations: { es: "Extendidos", pt: "Estendidos" },
    items: pluginDocsSidebarItems("extended"),
  },
  {
    label: "Advanced",
    translations: { es: "Avanzados", pt: "Avançados" },
    items: pluginDocsSidebarItems("advanced"),
  },
  {
    label: "Query",
    translations: { es: "Query", pt: "Query" },
    items: [
      {
        label: "Query cache",
        translations: { es: "Caché de consultas", pt: "Cache de consultas" },
        link: "/query/",
      },
      {
        label: "Query devtools",
        translations: { es: "Query devtools", pt: "Query devtools" },
        link: "/plugins/query-kit/#devtools",
      },
    ],
  },
];

// https://astro.build/config
export default defineConfig({
  site: "https://alpine-demo-ten.vercel.app",
  integrations: [
    starlight({
      title: {
        en: "Alpine.js Toolkit · @ailuracode",
        es: "Alpine.js Toolkit · @ailuracode",
        pt: "Alpine.js Toolkit · @ailuracode",
      },
      description: "Modular Alpine.js toolkit — lazy init, headless plugins, modern TypeScript DX.",
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        es: {
          label: "Español",
          lang: "es",
        },
        pt: {
          label: "Português",
          lang: "pt",
        },
      },
      logo: { src: "./public/logo.png", alt: "ailuracode" },
      routeMiddleware: ["./src/route-data.ts"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ailuracode/alpinejs-toolkit",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/ailuracode/alpinejs-toolkit/edit/master/docs/",
      },
      head: [
        {
          tag: "script",
          content: getLocaleDetectScript(),
        },
      ],
      sidebar,
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        // Subpath before package root — Vite otherwise resolves via package exports → missing dist/
        { find: "@", replacement: path.join(root, "src") },
        { find: "@ailuracode/alpine-env", replacement: pkg("env") },
        { find: "@ailuracode/alpine-transfer", replacement: pkg("transfer") },
        { find: "@ailuracode/alpine-query-kit", replacement: pkg("query-kit") },
        { find: "@ailuracode/alpine-attention", replacement: pkg("attention") },
        { find: "@ailuracode/alpine-calendar", replacement: pkg("calendar") },
        { find: "@ailuracode/alpine-core", replacement: pkg("core") },
        { find: "@ailuracode/alpine-toast", replacement: pkg("toast") },
        { find: "@ailuracode/alpine-geo", replacement: pkg("geo") },
        { find: "@ailuracode/alpine-json-api", replacement: pkg("json-api") },
        { find: "@ailuracode/alpine-lang", replacement: pkg("lang") },
        { find: "@ailuracode/alpine-notify", replacement: pkg("notify") },
        { find: "@ailuracode/alpine-query", replacement: pkg("query") },
        {
          find: "@ailuracode/alpine-query-adapter-alpine",
          replacement: pkg("query-adapter-alpine"),
        },
        {
          find: "@ailuracode/alpine-query-adapter-zustand",
          replacement: pkg("query-adapter-zustand"),
        },
        { find: "@ailuracode/alpine-media", replacement: pkg("media") },
        { find: "@ailuracode/alpine-sidebar", replacement: pkg("sidebar") },
        { find: "@ailuracode/alpine-scroll", replacement: pkg("scroll") },
        { find: "@ailuracode/alpine-url", replacement: pkg("url") },
        { find: "@ailuracode/alpine-theme", replacement: pkg("theme") },
        { find: "@ailuracode/alpine-toggle", replacement: pkg("toggle") },
      ],
    },
  },
});
