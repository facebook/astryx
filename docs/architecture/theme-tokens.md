---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:theme-tokens
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/theme/tokens.stylex.ts,
    packages/core/src/theme/tokens.ts,
    packages/core/src/theme/localTokens.ts,
    packages/core/src/theme/domainTokens/,
    packages/core/src/theme/syntax/,
    packages/cli/assets/theme.template.ts,
  ]
verified_by:
  [
    packages/core/src/theme/tokens.test.ts,
    packages/core/src/theme/defineTheme.test.ts,
    scripts/check-theme-template.test.mjs,
    scripts/generate-token-docs.mjs,
  ]
deciding_specs: [spec:AST-006/DEC-1, spec:AST-006/DEC-5]
---

# Theme token architecture

This record defines the semantic token vocabulary that components, themes,
documentation, and non-CSS consumers share.

## Purpose

A theme author and a component author should refer to the same stable semantic
names. Changing a default theme, resolving a token in JavaScript, or generating
consumer documentation must not create a second token vocabulary.

## System model

Core tokens are declared as paired exports in `tokens.stylex.ts`:

- `*Defaults` objects hold default CSS values.
- `*Vars` objects are created from those defaults with `stylex.defineVars` and
  are what component styles consume.
- `defineTheme` combines the core defaults into the complete theme token type.
- `tokenVar`, `tokenVars`, `resolveThemeToken`, and `resolveThemeTokens` expose
  the same vocabulary to canvas, SVG, charts, tests, build tools, and other
  non-StyleX consumers.

Syntax-highlighting and data-visualization tokens are domain layers. They remain
separately importable so applications that do not use those domains do not need
their implementation modules, while `domainTokenDefaults` makes their names
available to theme validation and resolution.

The CLI theme template and generated token documentation are projections of
this vocabulary. They do not define additional tokens.

Theme-family-local tokens are a separate enrolled map. They may reuse the
existing token value shape, but they do not enter `TokenName`, defaults,
`tokenVar`, `tokenVars`, `resolveThemeToken`, `resolveThemeTokens`, generated
portable documentation, or Core component source. A name cannot be present in
both portable `tokens` and `localTokens` because CSS and non-CSS resolution would
then have contradictory winners.

## Boundaries and invariants

- **INV1 — `defineVars` declarations are canonical.** A core token name and its
  default originate in `tokens.stylex.ts`; projections do not introduce names.
- **INV2 — Defaults and typed variables move together.** Each core token family
  has one `*Defaults` object and matching `*Vars` export.
- **INV3 — Token names describe semantic roles.** Components consume purpose-led
  names such as text, surface, spacing, and motion roles rather than embedding a
  theme's raw palette choices.
- **INV4 — Mode-relative defaults remain one token.** A semantic role that varies
  by color mode uses a supported `light-dark()` or tuple value instead of
  creating unrelated light and dark token names.
- **INV5 — Domain layers are explicit.** Syntax and data tokens are available to
  theme authoring and resolution without being folded into the core component
  token module.
- **INV6 — Non-CSS consumers resolve the same graph.** JavaScript helpers follow
  token references and supported color expressions instead of maintaining a
  second set of resolved values.
- **INV7 — Projections cannot drift silently.** Theme-template inventory and
  generated token docs change with the canonical family or fail validation.
- **INV8 — Theme-local names stay non-portable.** Enrolled local declarations
  remain outside the canonical vocabulary, typed helpers, generated portable
  documentation, and Core component dependencies.

This record does not own:

- the `defineTheme` input shape, generated scales, or precedence;
- local-token names, meanings, enrollment, ownership, lineage, and emission;
- mounting, nesting, color-mode selection, or runtime theme observation;
- turning a normalized theme into scoped CSS and build files;
- component-specific targets, visual states, or private derived variables.

Those concerns belong to separate theming architecture records so a token change
does not silently change authoring, runtime, compiler, or component contracts.

## Change coupling

- Adding, removing, or renaming a core `*Defaults` family updates its `*Vars`
  export, the combined `TokenName`/defaults surface, the CLI template inventory,
  generated token docs, and drift tests together.
- Adding or changing a domain token updates that domain's defaults and exported
  name type; the aggregate domain map remains the validation bridge.
- Renaming or removing a released token is a compatibility decision, not a
  mechanical cleanup. Consumers may use its CSS custom-property name directly.
- Changing a default value is a visual behavior change and requires real-browser
  evidence for representative light/dark, status, and high-contrast surfaces.
- Changes to JavaScript resolution preserve CSS cascade semantics for supported
  references and color expressions; unsupported expressions remain intact
  rather than being guessed.
- Adding a theme-local name does not update portable defaults, name types,
  helpers, or generated token docs. Authoring validation rejects a duplicate
  across `tokens` and `localTokens` before the compiler or helpers can disagree.

## Owning code

- `packages/core/src/theme/tokens.stylex.ts` owns core token names, defaults, and
  StyleX variables.
- `packages/core/src/theme/domainTokens/` and
  `packages/core/src/theme/syntax/tokens.ts` own domain vocabularies.
- `packages/core/src/theme/defineTheme.ts` aggregates token types/defaults for
  validation and authoring; it does not become a second token source.
- `packages/core/src/theme/tokens.ts` owns server-safe references and resolution.
- `packages/core/src/theme/localTokens.ts` enforces the boundary between the
  portable and enrolled local maps; it does not add local names to this
  vocabulary.
- `packages/cli/assets/theme.template.ts` and generated token docs are checked
  projections for theme authors and consumers.

## Deciding specs

AST-006 decisions 1 and 5 establish that theme-local names are additive,
theme-family contracts rather than portable Astryx tokens. The existing portable
vocabulary and helper architecture remain unchanged.

## Verification

| Invariant                    | Evidence                                                                  | Failure signal                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| INV1, INV2, INV7             | `scripts/check-theme-template.test.mjs` and token-doc generation check    | A token family exists without a matching author-facing inventory or generated documentation               |
| INV5                         | Domain-token exports and theme-generation tests                           | Domain names disappear from validation or require importing unused domain implementation                  |
| INV6                         | `packages/core/src/theme/tokens.test.ts`                                  | JavaScript resolution disagrees with defaults, mode selection, references, or supported color expressions |
| INV8                         | `defineTheme.test.ts`, template checks, and token-doc generation          | A local name enters portable helpers/docs or can conflict with a portable declaration                     |
| Released token compatibility | Type checking plus representative package/source builds                   | A released CSS variable or typed token name disappears without an explicit migration decision             |
| Visual defaults              | Real Chromium examples in light, dark, status, and high-contrast contexts | A changed default produces unreadable or semantically inconsistent output                                 |
