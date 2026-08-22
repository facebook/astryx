---
'@astryxdesign/core': patch
---

[fix] `DateInput`, `DateTimeInput`, `DateRangeInput`, and `Calendar` now format and parse dates using the ambient `InternationalizationProvider` locale instead of the host/browser locale. `plainDateFormat` (backing `formatSharedDate`) previously called `Intl.DateTimeFormat(undefined, ...)`, and `dateParser`'s day/month disambiguation heuristic for ambiguous numeric input (e.g. `3/4/2026`) called `Intl.DateTimeFormat()` with no locale at all, so a tree wrapped in a non-English `locale` still formatted and parsed dates using the host locale.

@HelloOjasMutreja
