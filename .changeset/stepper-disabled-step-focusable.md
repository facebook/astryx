---
'@astryxdesign/core': patch
---

[fix] In a clickable `Stepper`, a disabled `Step` now keeps its button: it stays in the tab order, is announced as unavailable (`aria-disabled`), and keeps focus if it becomes disabled while focused, but still does not activate. Before, it rendered as plain text, so keyboard and screen-reader users could not find it or tell it was unavailable.

@cixzhang
