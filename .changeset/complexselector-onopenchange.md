---
'@astryxdesign/core': patch
---

[feat] ComplexSelector: `onOpenChange` reports every open and close of the popup — the trigger, the keyboard, a light dismiss, Escape, content calling `close()`, or the imperative handle. Paired with the existing `handleRef`, a consumer can drive and observe the surface without reading the shell's DOM.

@cixzhang
