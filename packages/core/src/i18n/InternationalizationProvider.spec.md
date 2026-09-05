---
schema_version: 3
template_version: 4
kind: component
id: component:InternationalizationProvider
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, nynexman4464]
review_triggers: [public-api, behavior, accessibility]
verified_by:
  [
    packages/core/src/i18n/__tests__/resolve.test.ts,
    packages/core/src/i18n/__tests__/useDirection.test.tsx,
    packages/core/src/i18n/__tests__/getLocaleDirection.test.ts,
    packages/core/src/i18n/__tests__/useLocale.test.tsx,
    packages/core/src/i18n/useTranslator.test.tsx,
  ]
modules: []
families: []
design_specs: []
architecture: [architecture:internationalization]
contributing: []
system_specs: []
---

# InternationalizationProvider component contract

## Intent

InternationalizationProvider binds one subtree to Astryx's active locale,
translation catalogs, sparse Astryx string overrides, and direction default. It
lets Astryx components localize their own interface while applications keep
ownership of product copy and locale persistence.

## Compatibility and migration

- Released default preserved: `yes` — a tree with no provider continues to render
  shipped English strings with locale `en` and direction `ltr`.
- Compatibility class: the released provider name, `@astryxdesign/core/i18n`
  subpath, props, context behavior, and hooks are stable public API.
- Controlled/uncontrolled behavior: controlled. The caller supplies locale,
  messages, overrides, and optional direction on every render.
- Migration decision: a replacement provider or hook requires an accepted
  compatibility and migration decision under
  `architecture:internationalization/INV2`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The active Astryx locale and optional explicit direction for one React subtree.
- Binding supplied locale catalogs and sparse overrides to a stable translator
  function.
- Updating provider consumers when any provider input changes.
- The no-provider English/LTR context defaults exposed by the i18n entry point.

**Does not own / non-goals**

- Application locale selection, routing, persistence, or account preferences —
  owned by the product.
- Product-authored strings and application catalogs — owned by product call sites
  or their chosen i18n runtime.
- DOM `lang` or `dir` attributes — owned by the application document or region.
- A server/RSC translation context — unresolved separate API work.
- Rich React-node/function messages — outside the supported string catalog model.

## Public concepts

| Concept   | Closed values or states        | Meaning                                                                            | Availability by variant/orientation/state | Default                                     | Owner                                    | Stability | Invalid-value behavior                                                                                                                |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Locale    | Valid BCP 47 locale string     | Selects lookup, ICU formatting, and provider-aware locale operations               | Every provider subtree                    | Required on provider; `en` without one      | `component:InternationalizationProvider` | stable    | Callers must pass a valid tag; malformed tags may throw when formatting or collating, while static key lookup may still reach English |
| Messages  | locale → catalog map           | Adds translated or application-supplied catalogs without replacing shipped English | Every locale                              | `{}`                                        | `component:InternationalizationProvider` | stable    | Missing entries fall back through parent locales to English                                                                           |
| Overrides | locale → sparse key/string map | Rewords individual Astryx strings before catalog lookup                            | Every locale                              | none                                        | `component:InternationalizationProvider` | stable    | `null` does not become visible content; unresolved keys continue through fallback                                                     |
| Direction | `ltr` or `rtl`                 | Exposes the provider's semantic direction default                                  | Every provider subtree                    | derived from locale; `ltr` without provider | `component:InternationalizationProvider` | stable    | Invalid values are rejected by the type contract                                                                                      |

Consumer prop syntax and examples remain in
`InternationalizationProvider.doc.mjs` and `astryx docs internationalization`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                        | Basis                                              | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------ |
| FR1 | The provider MUST resolve Astryx strings through exact-locale overrides, parent-locale overrides, exact/parent supplied catalogs, then shipped English.                    | RFC #3641, released resolver, tests                | settled            |
| FR2 | A missing translated key MUST fall back silently; a key absent from English MUST warn once in development and render the key visibly.                                      | Released resolver and tests                        | settled            |
| FR3 | Re-rendering with changed locale, messages, overrides, or direction MUST update the context value and translator used by descendants.                                      | Released provider and rerender tests               | settled            |
| FR4 | The provider MUST NOT select, persist, or mutate application locale state.                                                                                                 | Released API ownership                             | settled            |
| FR5 | The provider MUST NOT set DOM `lang` or `dir`. Its direction value and the application's DOM direction are separate inputs the application keeps aligned.                  | `architecture:internationalization/INV12`          | settled            |
| FR6 | Without a provider, the public context and hooks MUST expose locale `en`, direction `ltr`, an empty supplied-catalog map, and a translator backed by shipped English.      | Released context and tests                         | settled            |
| FR7 | The provider MUST preserve a string-returning translator suitable for visible and assistive attributes.                                                                    | Released catalog/runtime contract                  | settled            |
| FR8 | A nested provider MUST replace locale, messages, overrides, and direction with values derived solely from the child provider's own props rather than merge parent context. | Current provider source; focused test still needed | settled            |

### Allowed variation

- **AV1 — Catalog completeness.** A non-English supplied catalog may contain any
  subset of English keys; missing entries use fallback.
- **AV2 — Locale specificity.** Callers may provide a regional, script, or base
  locale. The resolver canonicalizes and walks the corresponding parent chain.
- **AV3 — Application integration.** Another i18n provider may wrap Astryx inside
  or outside this provider as long as the application keeps locale state aligned.

### Representative states

| State                             | Required invariant | Allowed variation                        |
| --------------------------------- | ------------------ | ---------------------------------------- |
| no provider                       | FR6                | none                                     |
| English provider                  | FR1–FR4, FR7       | messages and overrides may be omitted    |
| exact translated locale           | FR1–FR4, FR7       | complete or partial catalog              |
| regional locale with base catalog | FR1–FR4, FR7       | number of parent tags                    |
| runtime locale swap               | FR3                | application persistence mechanism        |
| explicit direction override       | FR3, FR5           | locale may remain LTR for testing        |
| nested provider                   | FR1–FR8            | child props fully replace parent context |

### Transformation and precedence order

- **ORD1 — Message resolution.** Read exact-locale override → walk parent-locale
  overrides → read exact-locale supplied catalog → walk parent supplied catalogs
  → read shipped English → warn and render the key if absent everywhere.
- **ORD2 — Direction resolution.** Use explicit `dir` when supplied; otherwise
  derive direction from locale; outside a provider use `ltr`.

### Performance and resources

- **PR1 — Stable translator identity.** A provider render with referentially
  unchanged inputs SHOULD preserve its memoized context value and translator.
- **PR2 — Parsed message reuse.** ICU formatter instances MAY be cached by locale
  and message while output remains equivalent to fresh formatting.

## Accessibility contract

- **AR1 — Assistive strings use the same resolution contract.** `aria-label`,
  `title`, live announcements, and other AT-facing Astryx strings MUST use the
  active translator and remain strings.
- **AR2 — Missing translations remain usable.** Expected non-English gaps MUST
  fall back to meaningful English rather than remove an accessible name or
  announcement.
- **AR3 — Direction remains available to browser semantics.** The provider MUST
  document that applications set DOM `dir`; a context value alone does not fix
  browser text flow, punctuation, focus order, or platform bidi behavior.

## Design relationships

| Anatomy or state     | Design requirement                                                            | Representation authority            | Hierarchy role | Component contract |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------------------- | -------------- | ------------------ |
| Provider subtree     | Product chooses the locale and region direction consistently.                 | application-owned                   | supporting     | FR3–FR5            |
| Astryx system string | Astryx supplies a localized default; caller content may specialize semantics. | `architecture:internationalization` | supporting     | FR1, FR7, AR1      |
| Missing translation  | Interface remains understandable through English fallback.                    | `architecture:internationalization` | supporting     | FR2, AR2           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Provider boundary": {
    "none": {
      "reason": "intentional: InternationalizationProvider renders no DOM element and exposes no theming anatomy."
    }
  }
}
```

## Family and system relationships

- `architecture:internationalization` owns cross-library catalog, locale,
  formatter, date-calendar, output-type, and external-runtime boundaries.
- Component contracts own which strings are Astryx-authored and which content is
  caller-authored.

## Verification map

| Contract       | Verification                                                            | Representative states                                       | Mutation or failure expectation                                        | Audit section                                      |
| -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| FR1, FR2, ORD1 | `resolve.test.ts`                                                       | exact, parent, English, missing source key                  | Reordering fallback or hiding a missing source key fails focused tests | `audit:InternationalizationProvider/behavior`      |
| FR3, PR1       | provider/hook rerender tests                                            | stable inputs and locale/message/override/dir swaps         | A stale translator or needless identity churn fails hook tests         | `audit:InternationalizationProvider/performance`   |
| FR5, ORD2      | `useDirection.test.tsx`, `getLocaleDirection.test.ts`                   | derived, explicit, invalid locale, no provider              | Setting DOM direction or ignoring explicit override fails source/tests | `audit:InternationalizationProvider/rtl`           |
| FR6            | `useTranslator.test.tsx`, `useLocale.test.tsx`, `useDirection.test.tsx` | no provider                                                 | Host locale or missing English output fails                            | `audit:InternationalizationProvider/behavior`      |
| FR7, AR1, AR2  | component translation tests and hardcoded-string lint                   | visible text, aria label, announcement, missing translation | Non-string output or untranslated owned text fails tests/lint          | `audit:InternationalizationProvider/accessibility` |
| FR8            | focused nested-provider test to add before promotion                    | parent plus child provider                                  | Parent messages, overrides, or direction leaking into the child fails  | `audit:InternationalizationProvider/behavior`      |

## Decision log

### DEC-1 — Keep the released Astryx runtime narrow

**Reference:** `component:InternationalizationProvider/DEC-1`
**Decider:** `nynexman4464`, `2026-09-03`

Astryx keeps `InternationalizationProvider` and the released i18n hooks as its
canonical runtime. Astryx may support small applications, but it does not absorb
application-owned rich messages and functions to compete with full i18n
frameworks. Applications with larger needs use an established application i18n
runtime alongside Astryx; an adapter remains possible as additive follow-up.

Rejected: the parallel `IntlProvider`/`useIntl` proposal in PR #5684. It replaced
a working released surface, blurred Astryx and application catalog ownership,
and added rich-message complexity without demonstrated Astryx need.

## Open questions

- **OQ1 — Nested provider regression test.** Add focused coverage proving that
  child locale, messages, overrides, and direction replace rather than inherit
  parent context before promotion. (`checkable`)
- **OQ2 — Malformed locale behavior.** Decide whether a future release should
  reject invalid BCP 47 tags at the provider boundary or preserve today's
  formatter-specific throws. (`human-api`)
- **OQ3 — External runtime adapter.** Decide the exact additive `Translator`
  adapter contract, including who owns lookup, fallback, and formatter failures.
  (`human-api`)
- **OQ4 — Server translation runtime.** Decide whether the small set of otherwise
  server-safe consumers justifies a separate RSC translation API and request
  isolation model. (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, catalog validation
implementation, current translation coverage, or cross-library i18n rules. It
links to their owners.
