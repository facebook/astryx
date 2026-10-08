---
'@astryxdesign/core': patch
---

[fix] Keep `useHoverCard()` trigger refs stable across unchanged rerenders. The hook returned a fresh `ref`/`interactionRef` on every render because its callbacks depended on the whole `layer` and `touch` objects, which are rebuilt each render — React detached and re-attached every trigger listener and rewrote the trigger's inline `anchor-name` on each rerender. Hooks now depend on the stable layer and touch members instead, mirroring the Tooltip fix in #5951. (#6472)
@ManoharPaturi
