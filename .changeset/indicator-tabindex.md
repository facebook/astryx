---
'@astryxdesign/core': patch
---

[fix] Indicator: a forwarded `tabIndex` no longer puts a tab stop inside a hidden subtree. Indicators are unconditionally `aria-hidden`, so a focusable one is an axe `aria-hidden-focus` violation — measured going from 0 to 1 in real Chromium the moment it is forwarded. `tabIndex` joins the a11y props `IndicatorProps` already omits, and is dropped at runtime for the spread case the type cannot see.

Also corrects two doc claims: a replacement must render `children` when they will actually draw something (`isRenderable`, not `children ?? mark`), and "passing `role` is a compile error" holds only for a literal attribute — a spread bypasses excess-property checking.

@cixzhang
