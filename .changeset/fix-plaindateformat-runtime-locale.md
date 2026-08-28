---
'@astryxdesign/core': patch
---

[fix] Date formatting now defaults to Gregorian calendar semantics across core, charts, and Schedule while still following the selected locale for language, numbering, and field order. (#5303)

The low-level public `plainDateFormat` helper continues to honor an explicitly supplied `calendar` option for compatibility; Astryx components do not expose that display-only exception and remain Gregorian. The deterministic English fallback also prevents server and browser locale differences from producing hydration mismatches when no provider locale is available. Locale-aware parsing only selects day-first or month-first order for ambiguous ASCII numeric dates; it does not parse localized month names, non-ASCII digits, or arbitrary locale-specific strings.

Fixes #5074.

@josephfarina
