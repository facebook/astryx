---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Theme-controlled media surfaces: Toast and Tooltip now share one CSS-only inverted-surface mechanism, and themes can opt a component out via `defineTheme({ surfaces: { toast: 'normal' } })`. This also fixes tooltips rendering dark-on-dark when nested inside an inverted Toast.
@cixzhang
