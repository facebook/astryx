---
'@astryxdesign/core': patch
---

[fix] Tooltip: add `role="tooltip"` to the floating layer, completing the ARIA tooltip pattern (the trigger already links to it via `aria-describedby`). Also gives test tooling a stable, non-hashed selector for the layer (#3240). Plumbed via a new optional `role` on the layer render props.
@durvesh1992
