import Alpine from "alpinejs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import dialogPlugin from "../src/index.js";

describe("@ailuracode/alpine-dialog alpine integration", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div x-data x-init="$store.dialog.register('settings')">
        <button id="open" type="button" @click="$store.dialog.open('settings')">Open</button>
        <strong id="state-method" x-text="$store.dialog.isOpen('settings')"></strong>
        <strong id="state-prop" x-text="$store.dialog.instances.settings?.open"></strong>
        <div id="panel-method" x-show="$store.dialog.isOpen('settings')">method</div>
        <div id="panel-prop" x-show="$store.dialog.instances.settings?.open">prop</div>
      </div>
    `;

    const register = dialogPlugin();
    Alpine.plugin(register);
    Alpine.start();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("updates the dom when the dialog opens", async () => {
    expect(document.getElementById("panel-method")?.style.display).toBe("none");
    expect(document.getElementById("panel-prop")?.style.display).toBe("none");

    document.getElementById("open")?.click();
    await Alpine.nextTick();

    const store = Alpine.store("dialog") as { instances: Record<string, { open: boolean }> };
    expect(store.instances.settings?.open).toBe(true);
    expect(document.getElementById("state-method")?.textContent).toBe("true");
    expect(document.getElementById("state-prop")?.textContent).toBe("true");
    expect(document.getElementById("panel-prop")?.style.display).not.toBe("none");
    expect(document.getElementById("panel-method")?.style.display).not.toBe("none");
  });
});
