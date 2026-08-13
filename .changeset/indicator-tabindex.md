---
'@astryxdesign/core': patch
---

[fix] Indicator: `IndicatorProps` also omits `tabIndex`. An indicator is unconditionally `aria-hidden`, so a tab stop on one is a focusable node inside a hidden subtree — an axe `aria-hidden-focus` violation. `tabIndex` is a plain identifier, so the omission makes it a compile error on its own, the same way `role` already is.

Also corrects two doc claims: a replacement must render `children` when they will actually draw something (`isRenderable`, not `children ?? mark`), and "passing `role` is a compile error" holds for a literal attribute — a spread bypasses excess-property checking.

@cixzhang
