---
'@astryxdesign/core': patch
---

[fix] HoverCard: a labelled card no longer puts `aria-expanded` on a trigger whose role cannot carry it

Since the dialog-popup contract landed, a labelled HoverCard set `aria-haspopup`, `aria-controls` and `aria-expanded` on its trigger whatever that trigger was. The first two are global ARIA attributes and are valid anywhere; `aria-expanded` is supported on a fixed set of roles, and a role-less trigger is not one of them. Every Timestamp with a hover card is a role-less trigger, so nine Timestamp stories reported a critical axe `aria-allowed-attr` violation across twenty-nine nodes.

`aria-expanded` is now emitted only when the trigger's role supports it. A role-less trigger keeps `aria-haspopup="dialog"` and `aria-controls`, so the popup relationship is still advertised — only the state the element could never have expressed is dropped, and if it carried its own `aria-expanded` that value is left alone. On a trigger whose role does support the attribute nothing changes: the card drives it, overwriting the trigger's own value exactly as before.

@cixzhang
