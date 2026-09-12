---
'@astryxdesign/core': patch
---

[fix] Spinner: route the default assistive label through the translation runtime (#6214)

A bare `<Spinner />` with no `aria-label` or string `label` announced the
literal English word "Loading" to assistive technology, even inside a
localized application. The default now resolves through `useTranslator`
via a new `@astryx.spinner.loading` catalog key, matching the pattern
already used for `typeahead.loading`, `commandPalette.loading`, and
`button.loading`. An explicit `aria-label` or string `label` still wins,
unchanged.

@HelloOjasMutreja
