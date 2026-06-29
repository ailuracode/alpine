import anchor from "@alpinejs/anchor";
import Alpine from "alpinejs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import tooltipPlugin from "../src/index.js";

describe("@ailuracode/alpine-tooltip playground markup", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div
        x-data="{
          demos: [
            { id: 'tip-top', placement: 'top', label: 'Top', text: 'Top placement' },
          ],
        }"
        x-init="demos.forEach(d => $store.tooltip.register(d.id, { openDelay: 0, closeDelay: 80 }))"
      >
        <strong id="active" x-text="demos.find(d => $store.tooltip.isOpen(d.id))?.placement ?? '—'"></strong>

        <template x-for="demo in demos" :key="demo.id">
          <div
            class="demo-cell"
            x-data="{
              id: demo.id,
              placement: demo.placement,
              text: demo.text,
              label: demo.label,
            }"
          >
            <div x-ref="triggerWrap">
              <button
                type="button"
                class="trigger"
                @mouseenter="$store.tooltip.showOnHover(id)"
                @mouseleave="$store.tooltip.hideOnHover(id)"
                x-text="label"
              ></button>
            </div>

            <template x-if="placement === 'top'">
              <div
                id="tooltip-panel"
                x-show="$store.tooltip.isOpen(id)"
                x-anchor.top.fixed.offset.8="$refs.triggerWrap"
                role="tooltip"
                x-text="text"
              ></div>
            </template>
          </div>
        </template>
      </div>
    `;

    window.Alpine = Alpine;
    Alpine.plugin(anchor);
    Alpine.plugin(tooltipPlugin());
    Alpine.start();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("updates active placement label in parent scope", async () => {
    expect(document.getElementById("active")?.textContent).toBe("—");

    const trigger = document.querySelector(".trigger") as HTMLButtonElement;
    trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await Alpine.nextTick();

    expect(document.getElementById("active")?.textContent).toBe("top");
  });

  it("opens tooltip panel on hover", async () => {
    const trigger = document.querySelector(".trigger") as HTMLButtonElement;
    trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await Alpine.nextTick();

    const panel = document.getElementById("tooltip-panel");
    expect(panel).not.toBeNull();
    expect(panel?.style.display).not.toBe("none");
    expect(panel?.textContent).toBe("Top placement");
  });
});
