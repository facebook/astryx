---
'@astryxdesign/core': patch
---

[fix] Spinner: the default assistive label now comes from the translation catalog (`@astryx.spinner.loading`) instead of a literal `"Loading"` in component source, so a localized app translates the status. An explicit `aria-label` and a visible string label still take precedence, in that order.

@Kyujenius
