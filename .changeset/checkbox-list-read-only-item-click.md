---
'@astryxdesign/core': patch
---

[fix] Clicking a read-only CheckboxList option that has an `onClick` now fires that handler once, instead of re-dispatching the click until the browser's call stack overflows (#6777).

@cixzhang
