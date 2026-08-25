---
'@astryxdesign/core': patch
---

[chore] `MoreMenu` builds its `astryx-more-menu` theme target through `themeProps()` instead of hand-assembling it with `stableClassName()`. The rendered DOM is unchanged — the class and any consumer `className` land on the same element as before — but the target now sits on the same reflection surface as every other one, so it can carry `data-*` state if it ever needs to. The four `*-clear-icon` aliases passed to `InputClearButton` move to `themeProps().className` for the same reason, again emitting the same class. The theming-targets guard now also checks the reverse direction — a documented target that nothing renders — package-wide across core, lab and richtext, so `theming.targets` stays a list of selectors that really exist.

@cixzhang
