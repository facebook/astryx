---
'@astryxdesign/core': patch
---

[fix] Indicator: a caller can no longer un-hide a decorative indicator. `IndicatorProps` now omits `aria-hidden`, `role`, `aria-label` and `aria-labelledby` — passing `role` is a compile error — and each indicator emits its own `aria-hidden` after `{...rest}`, so a forwarded one cannot win. Un-hiding an indicator had it announced next to the control that owns the accessible name, saying the same thing twice.

Nothing is stripped: every other prop, including a forwarded `aria-label`, still reaches the DOM, where it is inert inside an `aria-hidden` subtree. Note that TypeScript exempts hyphenated JSX attributes from excess-property checking, so the type alone cannot reject `aria-*`; the attribute order is what enforces it.

Fixes #4918.

@cixzhang
