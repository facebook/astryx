---
'@astryxdesign/core': patch
---

[fix] `DateInput`, `DateTimeInput`, `DateRangeInput`, and `Calendar` now format dates using the live `InternationalizationProvider` locale, including after the provider changes. Public date helpers retain optional locale parameters for compatibility but default to deterministic English and Gregorian `PlainDate` semantics when called without a provider locale.

The parser's locale-sensitive behavior is intentionally limited to choosing day-first or month-first order for ambiguous ASCII numeric input such as `3/4/2026`. It does not parse localized month names, non-ASCII digits, or arbitrary locale-specific strings.

@HelloOjasMutreja
