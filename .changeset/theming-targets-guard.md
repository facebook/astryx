---
'@astryxdesign/core': patch
---

[chore] `MoreMenu` builds its `astryx-more-menu` theme target through `themeProps()` instead of hand-assembling it with `stableClassName()`. The rendered DOM is unchanged — the class and any consumer `className` land on the same element as before — but the target now sits on the same reflection surface as every other one, so it can carry `data-*` state if it ever needs to.

@cixzhang
