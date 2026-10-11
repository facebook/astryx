---
'@astryxdesign/core': patch
---

[fix] The PowerSearch filter editor saves an "empty" operator filter (such as "is empty") exactly once. Choosing such an operator, or switching to a field whose default operator is one, now saves from that choice instead of from an effect, so the filter is no longer saved again when the parent re-renders with a new `onSave`, and is no longer saved twice in React StrictMode. Opening the editor on an already-complete empty-operator filter still saves it once, as before.

@cixzhang
