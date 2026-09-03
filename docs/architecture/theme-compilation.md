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
deciding_specs: [spec:AST-006/DEC-2, spec:AST-006/DEC-4]
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

1. `generateThemeRules` turns portable tokens, theme-local tokens, and component
   overrides into CSS rules.
2. The same code adds state rules, media-surface rules, scopes, and layers.
3. The `Theme` provider mounts those rules when a theme was not built ahead of
   time.
4. The CLI saves those rules into CSS and packages the related JavaScript and
   types.
5. A built theme preserves local-token ownership and lineage metadata and is
   marked so the provider does not compile or inject it again.

For top-level declarations in base component target rules, the compiler preserves
generic CSS properties as written. When a guaranteed property needs to reach
internal painters, the checked registry additionally translates it into one or
more private variables and may replace the source declaration when applying it to
the target element would be wrong. Reviewed public semantic custom properties
pass through as direct author input. Direct private `--_*` input is prohibited by
the contract; current runtime, build, pseudo-rule, and media-surface conformance
gaps are listed below.

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
- **INV5 — Guaranteed properties remain observable.** The compiler preserves a
  guaranteed target property directly when that produces the promised effect. If
  internal structure prevents that, one checked registry entry may route,
  transform, or fan the public property out to one or more private component
  variables; the implementation choice cannot change the property's promised
  meaning.
- **INV6 — Private variables stay private.** Private `--_*` variables are
  compiler/component implementation details. Theme authors use the guaranteed
  property that owns them. Runtime and built authoring paths must reject direct
  private values rather than emitting them as plausible output.
- **INV7 — Public semantic variables pass through deliberately.** A reviewed
  public custom property is direct author input only when the component-theming
  contract admits it because no guaranteed CSS property expresses the need. The
  compiler must preserve it without turning private machinery into public API.
- **INV8 — Generic properties do not become promises by compiling.** The generic
  styling pipeline may emit properties outside a target's guaranteed set. Output
  alone does not make their effect or compatibility part of the public contract.
- **INV9 — Platform details stay out of shared authoring.** CSS selectors, layers,
  scopes, and custom properties belong to the web compiler. A native compiler
  may use native style objects.
- **INV10 — Shared intent keeps the same meaning.** A token or supported component
  override means the same thing across outputs. Platform-only features have an
  explicit support boundary.
- **INV11 — Theme-local names remain exact.** For an enrolled theme, the compiler
  emits the normalized `localTokens` map beside portable declarations without
  rewriting names or values. Runtime and static output use the same rules, and
  invalid enrolled input is rejected before either path writes partial CSS.

This record does not own:

- token names and defaults, including the meanings of theme-local names;
- `DefineThemeInput`, local-token enrollment and lineage, inheritance, or
  authoring precedence;
- which component parts and properties are public theme APIs; or
- provider nesting, root synchronization, and DOM observation after compilation.

## Change coupling

- Any change to how a web theme becomes CSS belongs in the shared compiler and
  is tested through both runtime mounting and CLI-built output. The Theme
  provider and CLI may mount or package compiled rules; they must not implement
  their own theme-to-CSS transformations.
- Adding or changing a guaranteed property path uses the target's exact
  `guaranteedProperties` declaration and adds representative compiler and runtime
  evidence that the property produces its promised effect on that target's
  anatomy part. Catalog membership alone is not a guarantee. If private expansion
  is needed, update the checked registry and component metadata in the same
  change.
- Adding or changing a public semantic custom property verifies direct runtime
  and built output, default/fallback behavior, and rejection of any private alias.
- Generic-property pass-through remains best effort and must not be documented or
  tested as a compatibility guarantee unless the component-theming record admits
  that property into the guaranteed set.
- Changing scope or layer output tests both source and distribution builds.
- Changing local-token emission or packaging verifies exact-name runtime/static
  parity, atomic failure, and preservation of built-theme lineage metadata.
- Adding a platform compiler names the shared concepts it supports and tests
  that they keep the same meaning. Unsupported concepts fail clearly instead of
  disappearing.
- Build packaging may change without changing compiled theme behavior.

## Owning code

- `generateThemeRules.ts` owns the web compiler and canonical CSS output,
  including portable and theme-local declarations in the same scoped block.
- `Theme.tsx` mounts compiled CSS for themes that were not built ahead of time.
- `derivedVarRegistry.ts` owns checked mappings from guaranteed public properties
  to private component variables.
- Component `.doc.mjs` `theming.derived[]` mirrors those mappings;
  `theming.vars[]` distinguishes reviewed public semantic variables from private
  implementation variables.
- `packages/cli/api/theme/build/build.mjs` saves and packages compiled CSS. Its
  private-variable diagnostic is currently non-blocking; rejecting that input is
  a named conformance gap, not existing enforcement.
- Future platform compilers consume the same `DefinedTheme` behind this boundary.

## Deciding specs

AST-006 decisions 2 and 4 establish exact local-token output and atomic shared
validation for enrolled themes. The system owner separately selected one
definition with platform-specific outputs and the guaranteed, best-effort,
public-semantic, and private implementation tiers.

## Verification

| Invariant        | Evidence                                                           | Failure signal                                                                                  |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| INV1, INV2, INV3 | Compiler imports and runtime/build comparison fixtures             | Runtime and build use different theme-to-CSS logic or produce different web rules               |
| INV4             | `generateThemeRules.test.ts` and source/distribution cascade tests | Scope or layer order differs by output path                                                     |
| INV5             | Existing per-property fixtures (partial; gap below)                | A guaranteed property compiles but does not produce its promised observable effect              |
| INV6, INV7       | Existing registry and CLI public-variable tests (partial)          | Private variables become authorable, or a reviewed public semantic variable fails build/runtime |
| INV8             | Component target metadata and compatibility review                 | Successful generic emission is treated as a guaranteed public behavior                          |
| INV9, INV10      | Platform compiler tests when another compiler ships                | CSS details enter shared authoring, or shared theme intent silently disappears                  |
| INV11            | `defineTheme.test.ts` and `build.test.mjs` local-token fixtures    | Runtime/static output rewrites a local name, disagrees, or leaves partial output after failure  |
| Built themes     | Theme and CLI build tests                                          | Runtime recompiles a built theme, or built output omits canonical rules                         |

## Known conformance and verification gaps

The invariants above are the approved current contract. The following shipped
behavior does not yet conform and must not be treated as enforcement:

- **Private author input is not rejected end to end.** `themeBuild` reports direct
  `--_*` values as errors in its receipt/log, but continues compiling and emits
  them. Its validation checks only the top-level declarations under
  `components`; nested pseudo declarations and media-surface components bypass
  it. Runtime `defineTheme` has no equivalent validation and accepts them. The
  follow-up must reject direct private variables recursively before CSS
  generation across both paths and prove runtime/static parity.
- **Pseudo and media-surface component overrides bypass derived expansion.**
  Top-level, non-pseudo base declarations use `derivedVarRegistry`, including
  `replaces` and container expansion. Base pseudo declarations and
  `onDark.components` / `onLight.components` declarations currently serialize
  properties directly. The follow-up must use one component-declaration lowering
  path for base, pseudo, and media-surface rules, with parity fixtures for a
  normal mapping, `replaces`, and container padding.
- **Guaranteed-property coverage is not machine-complete.** The shared catalog is
  normative, but the component-doc schema has no per-target
  `guaranteedProperties` declarations. CI therefore cannot prove that a target
  rationally supports its selected catalog subset or reviewed additions. The
  follow-up must add and migrate that metadata, then fail when a declared
  target/property pair lacks both output-path and observable runtime evidence.

These invariants are the approved rules governing implementation and review. The
nonconformities above are shipped defects against that contract, not proposed
behavior.
