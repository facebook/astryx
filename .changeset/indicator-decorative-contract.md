---
'@astryxdesign/core': patch
---

[fix] Indicator: a caller can no longer un-hide or focus a decorative indicator (#4921, #4947).

`IndicatorProps` now omits `aria-hidden`, `role`, `aria-label`, `aria-labelledby` and `tabIndex` — passing `role` or `tabIndex` is a compile error — and each indicator emits its own `aria-hidden` after `{...rest}`, so a forwarded one cannot win. Un-hiding an indicator had it announced next to the control that owns the accessible name, saying the same thing twice; a tab stop on one is a focusable node inside a hidden subtree, an axe `aria-hidden-focus` violation.

Nothing is stripped: every other prop, including a forwarded `aria-label`, still reaches the DOM, where it is inert inside an `aria-hidden` subtree. Note that TypeScript exempts hyphenated JSX attributes from excess-property checking, so the type alone cannot reject `aria-*`; the attribute order is what enforces it. `tabIndex` is a plain identifier, so its omission stands on its own.

Also corrects two doc claims: a replacement must render `children` when they will actually draw something (`isRenderable`, not `children ?? mark`), and "passing `role` is a compile error" holds for a literal attribute — a spread bypasses excess-property checking.

Fixes #4918.

@cixzhang
