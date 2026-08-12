---
'@astryxdesign/core': minor
---

[breaking] Indicator: `IndicatorProps` no longer accepts `aria-hidden`, `role`, `aria-label`, `aria-labelledby` or `tabIndex`. An indicator is decorative — the control that renders one owns the role, the accessible name and the focus — so un-hiding one had it announced next to that control, saying the same thing twice, and making one focusable put a tab stop inside an `aria-hidden` subtree.

Passing any of them as a literal JSX attribute is now a compile error. Passing one through a spread still compiles (TypeScript exempts hyphenated JSX attribute names from excess-property checking, and a spread bypasses the check for the rest), so the components also emit their own `aria-hidden` after `{...rest}` and drop a forwarded `tabIndex` — that ordering, not the type, is what actually enforces the contract.

Nothing else is stripped: `data-*`, `id`, handlers, `dir`, `className`, `style` and `xstyle` all still forward. `astryx upgrade` removes the five props from indicator call sites.

Fixes #4918, #4937.

@cixzhang
