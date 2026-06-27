import * as Alpine from "alpinejs";
import { initPlugins } from "@ailuracode/alpine-core";
import { registerDemoPlugins, setupDemoExtensions } from "./entrypoint";

export async function startAlpineDemo(): Promise<void> {
  registerDemoPlugins();
  await initPlugins(Alpine);
  setupDemoExtensions(Alpine);
  window.Alpine = Alpine;
  Alpine.start();
}
