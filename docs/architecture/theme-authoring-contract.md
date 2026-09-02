---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:theme-authoring-contract
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/theme/defineTheme.ts,
    packages/core/src/theme/expandColorScale.ts,
    packages/core/src/theme/expandTypeScale.ts,
    packages/core/src/theme/expandRadiusScale.ts,
    packages/core/src/theme/expandMotionScale.ts,
    packages/core/src/theme/mergeComponents.ts,
    packages/core/src/theme/onMediaTokens.ts,
    packages/core/src/theme/localTokens.ts,
    packages/cli/assets/theme.template.ts,
  ]
verified_by:
  [
    packages/core/src/theme/defineTheme.test.ts,
    packages/core/src/theme/expandColorScale.test.ts,
    packages/core/src/theme/expandTypeScale.test.ts,
    packages/core/src/theme/expandRadiusScale.test.ts,
    packages/core/src/theme/expandMotionScale.test.ts,
    packages/core/src/theme/onMediaTokens.test.ts,
    scripts/check-theme-template.test.mjs,
  ]
deciding_specs:
  [
    spec:AST-006/DEC-1,
    spec:AST-006/DEC-2,
    spec:AST-006/DEC-3,
    spec:AST-006/DEC-4,
    spec:AST-006/DEC-6,
  ]
---

# Theme authoring contract

This record defines what a theme author may express and how `defineTheme`
normalizes that input into one self-contained theme representation.

## Purpose

A theme author should describe design intent once. Runtime mounting and static
builds should consume the same normalized result instead of reinterpreting the
source configuration independently.

## System model

`DefineThemeInput` accepts:

- a name and optional normalized base theme;
- higher-order color, typography, radius, and motion configuration;
- explicit semantic token overrides;
- optional theme-family-local token declarations;
- component target/style-key overrides;
- icon and indicator registries;
- syntax tokens; and
- `onDark` / `onLight` surface overrides.

`defineTheme` resolves that input into a flat `DefinedTheme`. An extended theme
contains the resolved values it inherits, so a build does not need the base
stylesheet at runtime.

Normalization follows one precedence order:

1. the resolved base theme;
2. values generated from color, typography, radius, and motion configuration;
3. explicit token overrides;
4. generated component typography followed by explicit component overrides;
5. inherited and explicit media-surface overrides;
6. inherited and explicit theme-local declarations, validated against the
   resolved token, component, and media surfaces; and
7. inherited and explicit icon/indicator registry entries.

Explicit values win within their surface. Component maps merge by component,
style key, and CSS property rather than replacing the entire inherited target.

## Boundaries and invariants

- **INV1 — One input produces one normalized theme.** Runtime and build consumers
  receive the same `DefinedTheme`; they do not implement separate authoring
  semantics.
- **INV2 — Precedence is deterministic.** A value's winner follows the documented
  order and does not depend on object traversal outside that order.
- **INV3 — Extension is flattened.** `extends` accepts a real `DefinedTheme`,
  carries forward its resolved tokens, component rules, media surfaces, icons,
  and indicators, and produces a self-contained child.
- **INV4 — Invalid bases fail loudly.** An undefined, namespace, or plain object
  passed to `extends` cannot produce a plausible partial theme.
- **INV5 — Explicit tokens override generated scales.** Generated values provide
  coherent defaults; an explicit semantic token wins token by token.
- **INV6 — Component overrides merge deeply.** Restating one CSS property keeps
  inherited properties on the same component/style key.
- **INV7 — Surface overrides inherit coherently.** `onDark` and `onLight` combine
  system defaults, inherited surface values, and local overrides in that order.
- **INV8 — Local-token enrollment is explicit and closed.** Supplying
  `localTokens`, or extending an exact enrolled base, produces a flattened local
  declaration map plus ownership and lineage metadata. Enrolled themes validate
  exact namespaces, case-insensitive `var()` references, cycles, and collisions
  with `tokens`; unenrolled themes retain their legacy behavior.
- **INV9 — Authoring and output are separate systems.** This record owns the
  normalized theme definition. The shared compiler owns turning it into styles;
  runtime and build own using or saving that output.

This record does not own:

- semantic token names/defaults;
- turning `DefinedTheme` into style rules, including local-token emission,
  private-variable expansion, and cascade/layer behavior;
- runtime mounting, scope lifetime, root synchronization, or DOM observation;
- CLI file generation and packaging; or
- which component targets, states, and public properties participate.

`architecture:theme-compilation` owns platform output. For web, runtime and
static build use one CSS compiler and the same maintained stylesheet rules. A
future native compiler may turn the same theme definition into native style
objects without making CSS concepts part of shared authoring. Runtime application
and CLI packaging use the compiled output without changing it. The participating
public surface belongs to
`architecture:component-theming-surface`.

## Change coupling

- Adding an authoring field defines its normalization, precedence, inheritance,
  validation, template exposure, and negative tests together.
- A local-token change preserves explicit enrollment, exact owner namespaces,
  source/built lineage parity, and the separation from portable `tokens`. One
  name cannot appear in both maps because CSS output and portable token helpers
  would otherwise resolve different values.
- Changing precedence is a compatibility decision because existing themes may
  contain both generated and explicit values.
- Changing `ComponentStyleMap` merge behavior verifies base, generated, explicit,
  and on-media composition; no layer invents its own merge rule.
- A new generated scale states which semantic tokens it may produce and confirms
  explicit token overrides still win.
- Authoring fields unavailable to the runtime-only path are prohibited; build
  tooling may add emitted type/artifact metadata but not new theme semantics.

## Owning code

- `packages/core/src/theme/defineTheme.ts` owns the public input, normalized IR,
  orchestration, and extension behavior.
- `expandColorScale.ts`, `expandTypeScale.ts`, `expandRadiusScale.ts`, and
  `expandMotionScale.ts` own their derived token/component values.
- `mergeComponents.ts` owns the shared deep-merge rule.
- `onMediaTokens.ts` owns normalization of inverted-surface overrides.
- `localTokens.ts` owns opt-in enrollment, exact namespaces, reference closure,
  cycle detection, cross-map collision rejection, and flattened lineage.
- `packages/cli/assets/theme.template.ts` is an author-facing projection and must
  remain aligned; it does not define additional semantics.

## Deciding specs

AST-006 decisions 1–4 and 6 establish the shipped theme-local authoring shape,
exact naming and inheritance rules, enrolled-only validation, and shared value
contract. The remaining authoring and normalization architecture predates that
spec and remains unchanged.

## Verification

| Invariant            | Evidence                                                       | Failure signal                                                                              |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| INV1, INV2, INV5     | `defineTheme.test.ts` plus representative runtime/build parity | Runtime and build interpret one input differently, or generated values beat explicit tokens |
| INV3, INV4           | extension and invalid-base tests                               | Child themes require a base stylesheet or silently accept a non-theme base                  |
| INV6                 | component merge tests across base/generated/explicit rules     | Restating one property drops inherited component styles                                     |
| INV7                 | `onMediaTokens.test.ts` and generated surface-rule tests       | A child loses inherited surface customization or surface precedence changes                 |
| INV8                 | `defineTheme.test.ts` and CLI source/built inheritance tests   | Enrollment, validation, or lineage differs across runtime and static authoring paths        |
| Authoring projection | `scripts/check-theme-template.test.mjs`                        | A supported authoring concept is missing or misstated in the template                       |
