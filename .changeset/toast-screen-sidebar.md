---
"@ailuracode/alpine-toast": minor
"@ailuracode/alpine-screen": patch
"@ailuracode/alpine-sidebar": patch
---

Add headless `@ailuracode/alpine-toast` with dual timed/persistent stacks, `pushUnique`, promise loading in the timed stack, and store lifecycle helpers.

Fix `$store.device` and `$store.sidebar` reactivity by routing listener updates through the Alpine store proxy (`screen`, `sidebar`).

Update the Astro example with Sonner-style toast UI, shadcn components, and layout fixes for screen/sidebar bindings.
