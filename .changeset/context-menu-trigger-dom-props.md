---
'@astryxdesign/core': patch
---

[fix] `ContextMenu` puts only its four touch handlers on the trigger element. It used to spread everything `useLongPress` returns, which since the press model includes the hook's imperative `start`, `moveTo` and `cancel`, so React warned "does not recognize the `moveTo` prop" and "Invalid values for props `start`, `cancel`" on the first ContextMenu of a page. Long-press opening is unchanged.

@vjeux
