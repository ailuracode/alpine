import Alpine from "alpinejs";

export function startAlpine(...plugins) {
  for (const plugin of plugins) {
    Alpine.plugin(plugin);
  }

  document.body.innerHTML = '<div x-data x-init></div>';
  Alpine.start();

  return Alpine;
}
