---
'@astryxdesign/core': patch
---

[fix] CommandPalette, ComplexSelector and ContextMenu: a consumer's `onClick`/`onMouseEnter` is composed with the component's own handler instead of being overwritten by it, and `{...props}` no longer lands after the props the component must control (#4725).

@cixzhang
