---
'@astryxdesign/core': patch
---

[fix] The PowerSearch filter editor saves an "empty" operator filter (such as "is empty") exactly once, from the choice that completes it. Choosing such an operator, or switching to a field whose default operator is one, now saves from that choice instead of from an effect. The filter is no longer saved again when the parent re-renders with a new `onSave`, or twice in React StrictMode. Re-choosing the current operator or field saves nothing, and focus still returns to the search input after the editor closes. Clicking an existing empty-operator token in PowerSearch commits it once without opening the built-in editor; a `components.empty.Editor` override still opens. (#7347)

@cixzhang
