---
"@ailuracode/alpine-query-adapter-nanostores": patch
"@ailuracode/alpine-query-adapter-zustand": patch
"@ailuracode/alpine-query-devtools": patch
---

Fix Nanostores and Zustand adapters to apply `undefined` patch values (e.g. mutation `reset()` clears `data`). Route multi-store devtools actions by unique store id when adapter names repeat.
