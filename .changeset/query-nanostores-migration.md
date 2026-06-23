---
"@ailuracode/alpine-query": patch
---

Migrate internal query cache state from Alpine.reactive to Nanostores. Export `createQueryClient()` for framework-agnostic usage; Alpine plugin bridges Nanostores into `$store.query`.
