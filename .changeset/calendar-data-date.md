---
'@astryxdesign/core': patch
---

[fix] Calendar: cross-month keyboard navigation now resolves the focused date from the machine-readable `data-date` attribute instead of parsing the localized `aria-label` with `new Date()`. Previously, month-boundary arrow keys and PageUp/PageDown silently stopped working in non-English locales (e.g. fr-FR, ja-JP) where the label was unparseable (#3343).
@cixzhang
