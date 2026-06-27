import alpine from "alpinejs";
import { initPlugins } from "@ailuracode/alpine-core";
import { registerDemoPlugins, setupDemoExtensions } from "./entrypoint";

export async function startAlpineDemo(): Promise<void> {
  registerDemoPlugins();
  await Promise.all([initPlugins(alpine), document.fonts.ready]);
  setupDemoExtensions(alpine);
  window.Alpine = alpine;
  alpine.start();
}
