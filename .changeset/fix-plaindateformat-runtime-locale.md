---
'@astryxdesign/core': patch
---

[fix] Date helpers now use deterministic English and Gregorian defaults, while Calendar and date inputs format and parse with the live `InternationalizationProvider` locale. Explicit locale and calendar overrides remain supported.

Locale-aware parsing only selects day-first or month-first order for ambiguous ASCII numeric dates; it does not parse localized month names, non-ASCII digits, or arbitrary locale-specific strings.

@josephfarina
