---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:internationalization
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, nynexman4464]
applies_to:
  [
    packages/core/src/i18n/,
    packages/core/locales/,
    packages/core/src/utils/plainDate.ts,
    packages/core/src/utils/dateParser.ts,
    internal/eslint-plugin-astryx/,
    scripts/check-i18n-catalog.mjs,
  ]
verified_by:
  [
    packages/core/src/i18n/__tests__/resolve.test.ts,
    packages/core/src/i18n/__tests__/useLocale.test.tsx,
    packages/core/src/i18n/__tests__/useDirection.test.tsx,
    packages/core/src/i18n/__tests__/getLocaleDirection.test.ts,
    packages/core/src/i18n/__tests__/useCollator.test.tsx,
    packages/core/src/i18n/useTranslator.test.tsx,
    scripts/check-i18n-catalog.test.mjs,
    internal/eslint-plugin-astryx/no-hardcoded-i18n-string.test.mjs,
    internal/eslint-plugin-astryx/no-raw-intl-locale.test.mjs,
  ]
deciding_specs: []
---

# Internationalization architecture

## Purpose

Astryx localizes the system-owned text, formatting, comparison, and text direction
of its components without becoming a general application internationalization
framework. Applications continue to own product copy and may use any application
i18n runtime alongside Astryx.

This record captures the released contract that grew from RFC #3641 and the
implementation that followed. Consumer setup and examples remain in
`astryx docs internationalization`.

## System model

```text
consumer content prop
  → wins when the component exposes semantic specialization

InternationalizationProvider
  → active locale
  → optional locale catalogs
  → optional per-locale Astryx overrides
  → optional direction override

Astryx-owned string or locale-sensitive operation
  → provider-bound translator / locale / collator
  → exact locale
  → parent locale(s)
  → shipped English fallback
```

`@astryxdesign/core/i18n` is the canonical public entry point. The released
surface consists of `InternationalizationProvider`, `InternationalizationContext`,
their public value/prop types, `useTranslator`, `TranslatorFn`, `useLocale`,
`useCollator`, `useDirection`, `getLocaleDirection`, catalog types, and the
`Translator` interface.

## Boundaries and invariants

- **INV1 — Astryx owns Astryx strings, not application copy.** Component-owned
  labels, announcements, instructions, and assistive text use Astryx catalogs.
  Product content remains caller-owned. A content prop wins when Astryx exposes
  it for semantic specialization.
- **INV2 — The released provider and hooks are canonical.**
  `InternationalizationProvider` plus the hooks under
  `@astryxdesign/core/i18n` remain the supported runtime. A replacement provider,
  hook, subpath, or catalog ownership model needs an explicit compatibility and
  migration decision; a parallel public runtime is not added by convention.
- **INV3 — No provider is deterministic English.** Components used outside a
  provider resolve Astryx strings from the shipped English catalog, expose locale
  `en`, direction `ltr`, and do not read the browser or host locale implicitly.
- **INV4 — Runtime locale changes are live.** Re-rendering the provider with a new
  locale, messages, overrides, or direction updates consumers in that subtree.
  Astryx does not persist or select the application's locale.
- **INV5 — Fallback is ordered and silent for expected gaps.** For a valid BCP
  47 locale, resolution checks per-locale overrides from exact to parent locale,
  then supplied catalogs from exact to parent locale, then shipped English. A
  missing non-English translation silently falls back. A key absent from every
  source including English is a defect: development warns once and renders the
  key visibly. Malformed locale tags are outside this fallback guarantee and may
  throw when platform formatters or collators are constructed.
- **INV6 — English is the source contract.** `packages/core/locales/en.json`
  defines Astryx's key set, default messages, descriptions, and ICU runtime
  contracts. Translation catalogs may omit keys and fall back to English; they
  may not add stale keys or change the argument, select, plural, ordinal, tag, or
  nesting contract of a translated entry.
- **INV7 — Messages produce strings.** Astryx catalogs use ICU MessageFormat 1
  and `intl-messageformat`. The supported translation result is a string suitable
  for visible text and attributes such as `aria-label` and `title`. Rich React
  nodes, functions, and application-owned message objects are outside this
  runtime unless a later accepted contract adds them.
- **INV8 — Provider locale owns locale-sensitive behavior.** Astryx-owned date,
  time, number, relative-time, list, collation, speech-recognition, and similar
  operations receive the active provider locale explicitly. Production code does
  not substitute `navigator.language`, an omitted `Intl` locale, or a hardcoded
  locale for that value.
- **INV9 — Pure helpers have deterministic compatibility defaults.** A public pure
  formatter that predates provider threading may keep an optional locale for
  compatibility, but its omitted value resolves deterministically to English.
  Astryx-owned call sites pass the provider locale explicitly. New pure helpers
  require an explicit locale unless a current contract records another default.
- **INV10 — PlainDate component semantics remain Gregorian.** Locale changes
  language, numbering, and field order; it MUST NOT silently change the calendar
  used by Astryx `PlainDate` parsing, arithmetic, constraints, grids, or
  navigation. The low-level `plainDateFormat` compatibility surface may honor an
  explicitly supplied display calendar without claiming broader calendar
  support. Instant-display utilities that currently delegate calendar selection
  to `Intl` do not establish a first-class alternative-calendar contract; this
  record does not decide that broader behavior.
- **INV11 — Rendered direction comes from the DOM.** The provider exposes a
  semantic direction default, but Astryx layout, mirroring, and interaction SHOULD
  resolve from the rendered region through CSS logical properties,
  direction-conditioned CSS, or a lazy DOM read. `useDirection()` is a render-time
  last resort and MUST NOT replace the DOM as the ordinary source for component
  geometry or behavior, because provider direction can disagree with `<html dir>`
  and create first-paint or hydration errors.
- **INV12 — Locale and direction are related but distinct.** The provider derives
  a default direction from locale and accepts an explicit override. It does not
  mutate DOM `dir`. Applications own the page or region `dir`, and must keep it
  aligned with the provider when they want Astryx layout and browser text flow to
  share a direction.
- **INV13 — Client context is the current translation runtime.** The shipped
  translator and locale hooks are client-context APIs. Pure helpers such as
  `getLocaleDirection` remain server-safe. A server/RSC translation runtime is a
  separate API decision, not an implied capability of the current hooks.
- **INV14 — External-runtime integration is additive.** Applications may run
  another i18n provider alongside Astryx. A future adapter may delegate Astryx
  formatting to an application runtime while preserving Astryx key lookup,
  fallback, string results, and released provider compatibility. Astryx does not
  absorb application catalogs merely to offer a general-purpose i18n framework.

## Change coupling

Changes to the provider, context, public i18n barrel, resolver, catalog schema,
source catalog, locale-aware helpers, catalog validation, or i18n lint rules must
review this record. A change preserves the architecture only when its fallback,
ownership, deterministic defaults, runtime-update behavior, and output type remain
true.

A new public provider or hook, application-catalog ownership, rich-message output,
server translation runtime, implicit host-locale behavior, or non-Gregorian
component semantics is a new human API or ownership decision. It cannot be
inferred from an implementation pull request.

## Owning code

- `packages/core/src/i18n/` — provider, context, public hooks, locale-direction
  derivation, catalog types, and lookup/formatting runtime.
- `packages/core/locales/en.json` — source key set, default English messages, and
  translator descriptions.
- `packages/core/locales/*.json` — partial translated catalogs.
- `scripts/check-i18n-catalog.mjs` — source/translation key, syntax, runtime
  contract, and plural validation.
- `internal/eslint-plugin-astryx/no-hardcoded-i18n-string.js` — routes
  Astryx-owned user-facing strings through the catalog.
- `internal/eslint-plugin-astryx/i18n-key-format.js` — enforces the
  `@astryx.` namespace and camelCase catalog-key segments. This rule currently
  lacks its own focused test file; adding one is a verification gap.
- `internal/eslint-plugin-astryx/no-raw-intl-locale.js` — requires provider locale
  at Astryx-owned locale-sensitive call sites.
- Component contracts — own which semantic content is Astryx-authored versus
  caller-authored and which content props specialize a component.

## Deciding specs

No current system spec changes this shipped architecture. RFC #3641 is historical
design context; this record captures the released result and its deliberate
deltas.

## Verification

| Invariant          | Evidence                                                          | Failure signal                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV7         | hardcoded-string lint, catalog tests, component translation tests | Astryx-owned text bypasses catalogs, or non-string output reaches visible/AT attributes                                                        |
| INV2, INV13, INV14 | export drift checks, public i18n tests, compatibility review      | A parallel/replacement runtime lands without migration, or client hooks claim server behavior                                                  |
| INV3–INV5          | resolver and provider rerender tests                              | no-provider output depends on the host, locale swaps stay stale, fallback order changes, or malformed-locale behavior is described as graceful |
| INV6               | `check:i18n-catalog`, key-format lint, and focused mutation tests | stale/malformed keys, malformed ICU, or source/translation runtime-contract drift passes CI                                                    |
| INV8, INV9         | raw-Intl-locale lint and provider-locale regression tests         | Astryx output follows the host locale or an owned call omits locale                                                                            |
| INV10              | PlainDate helper and component locale tests                       | locale selection changes PlainDate arithmetic/calendar semantics or an explicit display override is ignored                                    |
| INV11, INV12       | direction helper/provider tests plus rendered RTL audit           | component layout reads provider direction instead of the region, provider mutates DOM, or overrides stop composing                             |
