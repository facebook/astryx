---
'@astryxdesign/core': patch
---

[fix] Avoid creating empty avatar, name, and metadata wrappers in `ChatMessage` for booleans, empty strings, and arrays, Fragments, or synchronous iterables with no renderable descendants. An inspectably empty name now uses the translated sender fallback label, while numeric values such as `0` still render. Iterables are materialized once so generators remain visible. Cyclic composite content is rejected; non-Fragment elements remain content and component output is not inspected.

@cixzhang
