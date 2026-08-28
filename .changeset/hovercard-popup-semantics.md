---
'@astryxdesign/core': patch
---

[fix] Labelled HoverCard triggers expose a dialog-popup relationship without flattening rich content into a description, and only roles that support `aria-expanded` receive that state (#5419, #5501)

The trigger now uses `aria-haspopup="dialog"`, `aria-controls`, and a role-gated `aria-expanded`; `useHoverCard` exposes the layer `id` and open state, while `describedBy` remains as a deprecated alias for compatibility. Unlabelled group cards keep their description relationship.

@gonzoblasco @cixzhang
