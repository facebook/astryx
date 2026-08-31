---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:theme-compilation
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/theme/generateThemeRules.ts,
    packages/core/src/theme/derivedVarRegistry.ts,
    packages/core/src/theme/Theme.tsx,
    packages/cli/api/theme/build/build.mjs,
    packages/build/,
  ]
verified_by:
  [
    packages/core/src/theme/generateThemeRules.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    packages/cli/api/theme/build/build.test.mjs,
    packages/cli/api/theme/build/build.public-component-vars.test.mjs,
  ]
deciding_specs: []
---

# Theme compilation

This record defines how one theme definition becomes usable styles.

## Purpose

A theme author defines a theme once. On the web, using the theme at runtime and
building it ahead of time must produce the same CSS behavior.

Other platforms may need different output. For example, a future native compiler
may produce style objects instead of CSS. It should still start from the same
theme definition.

## System model

The compiler receives a `DefinedTheme` from the theme-authoring system.

The current web compiler works like this:

1. `generateThemeRules` turns tokens and component overrides into CSS rules.
2. The same code adds state rules, media-surface rules, scopes, and layers.
3. The `Theme` provider mounts those rules when a theme was not built ahead of
   time.
4. The CLI saves those rules into CSS and packages the related JavaScript and
   types.
5. A built theme is marked so the provider does not compile or inject it again.

A future platform compiler may turn the same theme into a different output type.
Platform-specific details stay inside that compiler.

## Boundaries and invariants

- **INV1 — One definition can have many outputs.** Authors do not maintain
  separate definitions for the same shared theme intent.
- **INV2 — Web has one compiler.** Runtime and static builds call the same code to
  turn a theme into CSS.
- **INV3 — Mounting and saving do not change the rules.** The provider mounts
  compiled CSS. The CLI saves and packages it. Neither creates different theme
  behavior.
- **INV4 — Web uses one cascade contract.** Runtime and built CSS use the same
  scopes, `astryx-theme` layer, component overrides, and consumer precedence.
- **INV5 — Common property expansion happens once.** A public theme property may
  set several private component variables. That mapping lives in the checked
  compiler registry, not in each component or output path.
- **INV6 — Private variables stay private.** Theme authors use public properties
  and targets. Direct private `--_*` values are rejected.
- **INV7 — Platform details stay out of shared authoring.** CSS selectors, layers,
  scopes, and custom properties belong to the web compiler. A native compiler
  may use native style objects.
- **INV8 — Shared intent keeps the same meaning.** A token or supported component
  override means the same thing across outputs. Platform-only features have an
  explicit support boundary.

This record does not own:

- token names and defaults;
- `DefineThemeInput`, inheritance, or authoring precedence;
- which component parts and properties are public theme APIs; or
- provider nesting, root synchronization, and DOM observation after compilation.

## Change coupling

- Any change to how a web theme becomes CSS belongs in the shared compiler and
  is tested through both runtime mounting and CLI-built output. The Theme
  provider and CLI may mount or package compiled rules; they must not implement
  their own theme-to-CSS transformations.
- Adding a public-property expansion updates the checked registry, compiler
  tests, component metadata checks, and representative runtime/built output.
- Changing scope or layer output tests both source and distribution builds.
- Adding a platform compiler names the shared concepts it supports and tests
  that they keep the same meaning. Unsupported concepts fail clearly instead of
  disappearing.
- Build packaging may change without changing compiled theme behavior.

## Owning code

- `generateThemeRules.ts` owns the web compiler and canonical CSS output.
- `derivedVarRegistry.ts` owns checked mappings from public properties to private
  component variables.
- `Theme.tsx` mounts compiled CSS for themes that were not built ahead of time.
- `packages/cli/api/theme/build/build.mjs` saves and packages compiled CSS.
- Future platform compilers consume the same `DefinedTheme` behind this boundary.

## Deciding specs

None. The system owner selected one definition with platform-specific outputs
while this record was drafted.

## Verification

| Invariant        | Evidence                                                           | Failure signal                                                                    |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| INV1, INV2, INV3 | Compiler imports and runtime/build comparison fixtures             | Runtime and build use different theme-to-CSS logic or produce different web rules |
| INV4             | `generateThemeRules.test.ts` and source/distribution cascade tests | Scope or layer order differs by output path                                       |
| INV5, INV6       | Registry and CLI public-variable tests                             | Expansion is duplicated, or private variables become authorable                   |
| INV7, INV8       | Platform compiler tests when another compiler ships                | CSS details enter shared authoring, or shared theme intent silently disappears    |
| Built themes     | Theme and CLI build tests                                          | Runtime recompiles a built theme, or built output omits canonical rules           |
