---
'@astryxdesign/core': patch
---

[fix] plainDateFormat: don't format with the runtime's locale

`plainDateFormat` passed `undefined` to `Intl.DateTimeFormat`, so the locale
resolved to whatever the runtime happened to have. Across an SSR boundary that
is not the same on both sides: a host with no `LC_ALL` resolves the CLDR root
and emits `2026 M08` where the browser renders `August 2026`, and React reports
a hydration mismatch for every SSR'd `Calendar` or `DateInput` — including ones
the user never opened.

The locale now defaults to `'en'`, matching what `useLocale()` returns outside a
provider, and is accepted as an optional third argument so callers under an
`InternationalizationProvider` can thread the provider locale:
`plainDateFormat(pd, options, useLocale())`.

Existing two-argument calls keep working and become deterministic. Formatting
inside `Calendar`, `DateRangeInput` and `DateTimeInput` is unchanged in an
English runtime; a non-English runtime now needs the explicit locale to render
in its own language, which was the only way to get a stable SSR tree.

@josephfarina
