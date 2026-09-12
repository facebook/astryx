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
    packages/core/src/theme/themeAdaptations.ts,
    packages/core/src/theme/derivedVarRegistry.ts,
    packages/core/src/theme/Theme.tsx,
    packages/cli/api/theme/build/build.mjs,
    packages/cli/api/theme/build/core-interception.mjs,
    packages/build/,
  ]
verified_by:
  [
    packages/core/src/theme/generateThemeRules.test.ts,
    packages/core/src/theme/themeAdaptations.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    packages/cli/api/theme/build/build.test.mjs,
    packages/cli/api/theme/build/build.public-component-vars.test.mjs,
    packages/cli/api/theme/build/build.adaptation-core-compat.test.mjs,
    packages/cli/api/theme/build/build.packed-old-core.test.mjs,
  ]
deciding_specs:
  [
    spec:AST-006/DEC-4,
    spec:AST-012/DEC-3,
    spec:AST-012/DEC-4,
    spec:AST-034/DEC-1,
    spec:AST-034/DEC-2,
    spec:AST-034/DEC-3,
    spec:AST-034/DEC-4,
  ]
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
2. Ordered adaptation rules compile to separate media blocks after root rules.
   Blocks preserve author order and are never merged or value-diffed; media-surface
   overrides compile after them.
3. The same code adds state rules, media-surface rules, scopes, and layers.
4. The `Theme` provider mounts those rules when a theme was not built ahead of
   time.
5. The CLI saves those rules into CSS and packages the related JavaScript and
   types.
6. A built theme preserves local-token ownership, effective width points,
   generative-axis metadata, and normalized ordered rules, and is marked so the
   provider does not compile or inject it again.

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
- **INV11 — Theme-local names remain exact and prefix-independent.** For an enrolled
  theme, the compiler emits the normalized `localTokens` map beside portable
  declarations without rewriting names or values. A prefix neither grants nor
  restricts ownership. Exact references to effective enrolled declarations retain
  owner, lineage, collision, and cycle validation; non-exact references remain
  external. Runtime and static output use the same rules, and invalid enrolled input
  is rejected before either path writes partial CSS.
- **INV12 — Adaptation order is observable.** Root declarations emit first,
  adaptation blocks remain separate in authored order, and media-surface overrides
  emit last. Duplicate conditions and later root-restoring writes are preserved
  exactly; runtime and static output use the same blocks.
- **INV13 — Accepted family packaging is one keyed native set.** Family compilation
  starts from one complete plan per selected member, then emits exactly one keyed CSS
  containing all members, one CSS-free ESM exporting all complete members, one
  matching declaration, one manifest, and receipts. Shared CSS uses zero-specificity
  declarations and member deltas use `:scope`. The artifact key changes filenames
  only. Per-member family artifacts and runtime manifest assembly are prohibited.

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
- Changing adaptation output verifies authored block order, duplicate conditions,
  root-restoring writes, media-surface precedence, derived component lowering,
  and source/built extension parity.
- The CLI and core version independently, so a CLI that compiles adaptations
  against a core that does not is a supported pairing rather than a broken
  install. That pairing is bounded to the adaptation capability, not a general
  compatibility scheme for arbitrary older cores: a theme with no adaptation
  intent builds and emits the same CSS it always did, while valid rules, a custom
  width map, and present-but-malformed adaptation metadata all count as intent
  and fail with `ERR_CORE_INCOMPATIBLE` before any output is generated. A
  complete default width map with no rules is a no-op on both paths, because that
  is what core writes onto every resolved theme and every shipped built theme.
  Neither path may emit CSS with adaptation rules missing. Intent is read from
  resolved metadata when available; because a core that predates adaptations
  erases it, the build also records each raw `defineTheme()` input and associates
  it with the theme it produced. Only the selected theme's lineage decides, so an
  unused adaptive theme elsewhere in the graph does not fail a plain build. If
  that selected lineage contains an unobserved source package — whether the
  async fallback bypassed interception or CommonJS reached a core namespace that
  could not be wrapped — the build fails closed. Built package artifacts remain
  observable through their retained metadata. Captured raw typography, color,
  radius, and motion metadata is also retained when the old core omits `__axes`,
  so a current-core child extending the artifact resolves partial adaptation
  axes exactly as it would from source. Generated CSS is identical across the
  two cores for a theme with no adaptation intent; generated JavaScript and
  `@generated` provenance may differ because they record resolved metadata and
  the core version, so `--check` can legitimately report drift after an upgrade.
- Adding a platform compiler names the shared concepts it supports and tests
  that they keep the same meaning. Unsupported concepts fail clearly instead of
  disappearing.
- A family-packaging change follows `spec:AST-034`: it preserves complete member
  plans across separate CSS, ESM, type, and receipt tracks; emits only the exact keyed
  set; verifies zero-delta members and collision-safe bindings; and keeps manifest
  ownership, transactional publication, cleanup, and check behavior out of consumer
  runtime assembly.
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
  a named conformance gap, not existing enforcement. It also owns the
  adaptation-capability check for the installed core: baseline generation is
  required, and `generateAdaptationCSS` is demanded by valid or malformed
  adaptation intent in authored, resolved, or built input.
  `core-interception.mjs` owns capturing authored input and its generative axes:
  it hands the loading theme a core whose `defineTheme` is wrapped to record each
  raw input against the theme it returned, and reports loader paths it could not
  cover so erased intent never passes as clean.
- Future platform compilers consume the same `DefinedTheme` behind this boundary.

## Deciding specs

AST-006 DEC-4 continues to establish atomic shared validation for enrolled themes;
AST-034 DEC-4 supersedes AST-006 DEC-2 and only DEC-4's reserved-prefix clauses with
exact prefix-independent ownership. AST-012 decisions 3 and 4 establish ordered
adaptation blocks and source/built metadata parity. AST-034 decisions 1–3 establish
the keyed family artifact set, complete-plan-before-factoring rule, and
manifest-owned transactional generation. The system owner separately selected one
definition with platform-specific outputs and the guaranteed, best-effort,
public-semantic, and private implementation tiers.

`spec:AST-034` is current authority. It requires one native
`<artifactKey>.css` containing all selected members, one separate standard
`<artifactKey>.js` with all complete member exports, one `<artifactKey>.d.ts`, and one
`<artifactKey>.manifest.json` plus receipts. The caller-supplied key changes only the
coordinated filename stem. Complete plans precede factoring; shared CSS has zero
specificity; bindings are collision-safe; and the manifest owns transactional
generation, cleanup, and check behavior. Per-member family artifacts are prohibited.
The implementation remains unshipped, so the current standalone build remains the
only implemented path until conformance lands.

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
| INV12            | `themeAdaptations.test.ts` and CLI adaptation build fixtures       | Rule blocks merge/reorder/drop, surfaces lose precedence, or runtime/static CSS diverges        |
| INV13            | AST-034 implementation suite plus real-browser and type checks     | Keyed output is incomplete, emits per-member files, conflates tracks, or needs runtime assembly |
| Built themes     | Theme and CLI build tests                                          | Runtime recompiles a built theme, or built output omits canonical rules                         |

## Known conformance and verification gaps

The accepted AST-034 family-build contract is unshipped. The current CLI has no
family artifact set or `--family-key`; implementation must satisfy the spec's complete
structural, browser, type, transaction, cleanup, and check gates before this invariant
is treated as enforced.

The remaining invariants above describe the approved current contract. The following
shipped behavior does not yet conform and must not be treated as enforcement:

- **Private author input is not rejected end to end.** `themeBuild` reports direct
  `--_*` values as errors in its receipt/log, but continues compiling and emits
  them. Its validation checks only the top-level declarations under
  `components`; nested pseudo declarations and media-surface components bypass
  it. Runtime `defineTheme` has no equivalent validation and accepts them. The
  follow-up must reject direct private variables recursively before CSS
  generation across both paths and prove runtime/static parity.
- **Nested pseudo component declarations bypass derived expansion.** Top-level
  component declarations at the root, in adaptations, and under
  `onDark.components` / `onLight.components` use `derivedVarRegistry`, including
  `replaces` and container expansion. Nested pseudo declarations on those
  surfaces still serialize properties directly. The follow-up must route nested
  pseudos through the same component-declaration lowering path, with parity
  fixtures for a normal mapping, `replaces`, and container padding.
- **Guaranteed-property coverage is not machine-complete.** The shared catalog is
  normative, but the component-doc schema has no per-target
  `guaranteedProperties` declarations. CI therefore cannot prove that a target
  rationally supports its selected catalog subset or reviewed additions. The
  follow-up must add and migrate that metadata, then fail when a declared
  target/property pair lacks both output-path and observable runtime evidence.

These invariants are the approved rules governing implementation and review. The
nonconformities above are shipped defects against that contract, not proposed
behavior.
