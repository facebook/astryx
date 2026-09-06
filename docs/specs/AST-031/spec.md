---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-031
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture:
  [architecture:component-theming-surface, architecture:theme-compilation]
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [theme]
---

# Generated visual-prop contract system spec

## Intent

Theme validation, generated type augmentation, target discovery, and visual
probes should agree about every public component selector axis without parsing
human-readable type strings or shipping a TypeScript compiler in the CLI.

Astryx already declares the relevant facts in executable source: `themeProps()`
call sites name rendered targets and the values they reflect; TypeScript types
describe finite and open value domains; public augmentation interfaces identify
axes already wired for module augmentation; and component theming docs declare the
public target inventory. This change derives one versioned contract from those
facts during repository builds and publishes it with Core.

The contract records mechanically provable facts. It does not infer whether a
new extension point is desirable or whether an axis has a safe visual fallback.
Those remain component-contract and owner-review decisions.

## Non-goals

- Change theme authoring syntax or add fields to `defineTheme`.
- Ask component authors to duplicate finite values in `.doc.mjs` metadata.
- Treat every technically augmentable type as approved for theme extension.
- Make the published CLI depend on TypeScript or parse consumer source at runtime.
- Prove arbitrary third-party integration contracts that do not ship an
  equivalent generated artifact.
- Turn a failed derivation into evidence that an axis is open or extensible.
- Replace component specs, family contracts, or owner review for semantic API
  decisions.

## Terms

- **Visual-prop contract:** the generated, versioned inventory keyed by public
  theming target and visual-prop name.
- **Finite values:** the set of string and number literals proven by the
  TypeScript type of the reflected value after nullish members are removed.
- **Open primitives:** independently proven unconstrained `string` or `number`
  members. An axis may carry finite sentinels and an open primitive together,
  such as `'single' | 'multi' | number`.
- **Unresolved domain:** a documented visual prop whose domain cannot be proven
  from the current source graph. Unresolved is a derivation result, not a public
  extension point.
- **Augmentation-wired axis:** a visual prop whose checked type is derived from a
  public module-augmentation interface consumed by the prop type. Newer axes
  normally use `*Map`; historical interfaces such as `CustomTextTypes` remain
  valid existing wiring. This is a mechanical fact, not approval for a new API.

## Requirements

### Source-derived contract

- **FR1 — Public docs own the inventory; source proves it.** Current
  `.doc.mjs` `theming.targets` entries remain the closed public inventory of
  targets, visual props, and states. Generation MUST reconcile that inventory
  against every supported rendering mechanism, including `themeProps()`, direct
  stable classes, delegated surfaces, and documented legacy aliases. It MUST use
  TypeScript's binding and type rules to derive visual-prop domains from the
  actual reflected expression or, for a documented composition-only axis, from
  the checked public prop type of its documented owner. Missing or conflicting
  evidence MUST be reported rather than guessed.
- **FR2 — Visual props and states remain distinct.** Each generated selector key
  MUST carry the role declared by public docs. Only `visualProp` entries receive
  finite, open, or unresolved value domains and augmentation wiring. `state`
  entries remain bare selector capabilities; they are never treated as
  theme-generated value domains or module-augmentation points.
- **FR3 — Every public visual prop receives a derivation result.** The contract
  MUST classify every current documented target/visual-prop pair as resolved or
  unresolved. A resolved entry independently records normalized finite values and
  open primitive kinds, so `'single' | 'multi' | number` does not widen to
  arbitrary strings. Generation follows proven coercions back to the originating
  public prop type when the reflected expression has erased that distinction.
  Values normalize exactly as `themeProps()` does with `String(value)`; equal
  normalized values collapse to one selector, and strings sort lexically after
  numbers sort numerically. Unresolved entries use a versioned reason enum:
  `opaque-expression`, `unsupported-type`, or `missing-owner`. Conflicting
  ownership or incompatible evidence is a generation failure, never an unresolved
  result. Generation MUST NOT silently omit an entry.
- **FR4 — Generation records every augmentation path without inventing one.**
  The artifact MUST record a public augmentation interface when the checked prop
  type is derived from that interface and the value reaches a documented visual
  prop. It MUST exclude unrelated registry maps and similar names that are not in
  the prop's binding chain. Accepting this specification admits the audited set
  of existing public prop-augmentation interfaces as custom-value enrollment
  paths; each MUST have current fallback evidence before this record can become
  `current`. Adding or changing a path remains an owner-reviewed component API
  change with the same evidence requirement.

### Generated artifact and consumers

- **FR5 — Core publishes one versioned artifact.** The generated visual-prop
  contract MUST ship with the exact `@astryxdesign/core` package whose source it
  describes. Its bytes MUST be deterministic, repository-relative, free of
  absolute paths, and validated against a versioned schema. The source package
  and packed package MUST expose the same artifact.
- **FR6 — Production consumers do not run TypeScript.** `astryx theme build`,
  target discovery, generated variant declarations, and visual-probe generation
  MUST consume the generated artifact. They MUST NOT compile or scan Core
  TypeScript at command runtime. TypeScript remains a repository build and check
  dependency only.
- **FR7 — Finite closed axes fail closed.** A value on a finite axis without
  augmentation wiring MUST be one of the generated built-ins in every
  non-adaptation component layer. A rule value on that axis MUST also be built
  in; placing an unsupported value outside the rule MUST NOT launder it into a
  valid adaptation value.
- **FR8 — Existing augmentation wiring preserves enrollment behavior.** A custom
  finite value is eligible for generated declarations only when its contract
  entry names the existing public augmentation module and interface. Adaptation
  rules continue to use AST-012's effective-root requirement: a custom value with
  augmentation wiring MUST already be present on the effective root component
  surface, and a rule-only value MUST fail before output. This specification does
  not add or remove enrollment layers.
- **FR9 — Open and unresolved domains remain distinct.** An open axis MAY accept
  values of its proven primitive kind only when the value's canonical
  `String(value)` form is representable by the shared selector grammar; a theme
  key that would split, reinterpret, or fail to match the runtime class MUST be
  rejected. Open numeric values use canonical finite-number serialization, while
  generated finite sentinels remain valid alongside them. An unresolved axis
  follows the documented compatibility boundary in `spec:AST-012`; pass-through
  acceptance MUST NOT mark it open, finite, or augmentation-wired and MUST remain
  visible in repository coverage reports.
- **FR10 — Component-writing layers share one contract.** Root components,
  root-owned media-surface component layers, and adaptation component layers MUST
  use the same target, prop role, and domain facts. Existing warning-versus-error
  policy remains unchanged unless another accepted contract changes it. Equivalent
  unknown-target and unknown-prop conditions MUST emit the same warning string in
  the existing `warnings: string[]` receipt and human CLI channel across layers.

### Compatibility and evolution

- **FR11 — Version fallback is deterministic.** The CLI MUST read the artifact
  from the installed Core package it is already using. A present schema version
  supported by that CLI is authoritative. A missing artifact or unsupported
  schema version MUST use the existing doc-based compatibility path and MUST NOT
  substitute an artifact bundled for another Core version. A syntactically
  malformed artifact claiming a supported schema MUST fail theme build with
  `ERR_THEME_INVALID` before output.
- **FR12 — Integrations may adopt the contract independently.** A third-party
  component integration MAY ship a compatible generated contract for its own
  targets. Until it does, the CLI retains that integration's existing validation
  boundary. Core completeness MUST NOT be weakened because an integration is
  incomplete.

### Implementation constraints

- **IR1 — Generation is reproducible and checkable.** One generator MUST support
  write and check modes. Repository CI and package prepack MUST fail when the
  committed artifact differs from current source, docs, public extension wiring,
  or schema.
- **IR2 — Compiler scope is bounded.** Generation MUST use the repository's
  supported TypeScript configuration and only the package source needed to resolve
  Core selector expressions and public extension wiring. The artifact MUST not
  contain compiler-internal symbol IDs or depend on traversal order.
- **IR3 — One parser serves all consumers.** Artifact loading, schema validation,
  normalization, and compatibility handling MUST live in one shared module. Theme
  build and visual tooling MUST NOT grow independent fallback alias resolvers.
- **IR4 — Failure and fallback are atomic.** A malformed supported artifact or
  conflicting current source evidence MUST fail before theme CSS, JavaScript,
  declarations, or probe fixtures are partially written. Missing and unsupported
  artifact versions MUST select the legacy path under FR11 before any output is
  planned.

### Platform support

- Supported feature/engine floor: the Node and TypeScript versions already
  required to build the Astryx repository; published CLI execution keeps its
  existing Node floor and adds no TypeScript runtime requirement.
- Unsupported behavior: dynamic target names, opaque props bags, or types that the
  generator cannot prove are recorded as unresolved and handled under FR9; they
  are never guessed.
- Browser evidence: none for contract generation itself. Existing component and
  visual-gate evidence continues to prove that generated selectors reach the
  rendered pixels.

## Current-state impact

Today `astryx theme build` scans component docs at runtime and extracts quoted
strings and top-level numbers from authored type text. This covers most current
Core target/axis pairs but misses imported aliases such as `AvatarSize`, cannot
trace values reflected by derived subtargets, and cannot distinguish intentional
open domains from failed inference. Visual-probe generation maintains a second
alias-resolution path, so validator and probe coverage can drift.

The generated contract replaces those runtime discovery paths for Core. It fixes
closed-root laundering, gives adaptations the same finite-domain facts, and makes
all current targets visible as finite, open, or unresolved without adding theme
syntax. The accepted opaque-domain boundary in `spec:AST-012` remains available
for genuinely unresolved expressions and older packages.

This proposed record affects `architecture:component-theming-surface` and
`architecture:theme-compilation`. If accepted and implemented, those records add
the generated artifact to owning code and verification, and consumer theme docs
explain only user-visible diagnostics—not the maintainer extraction mechanism.

## Verification

| Contract         | Verification                                                         | Representative states                                                                                                             | Mutation or failure expectation                                                                                  |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FR1–FR3          | Generator unit tests plus full Core inventory check                  | local union; imported alias; derived expression; optional value; open string; deprecated alias; opaque bag                        | Removing type resolution or one target produces a named missing/conflicting entry rather than a smaller manifest |
| FR4              | Existing augmentation structural guard plus component fallback tests | closed finite axis; existing public augmentation interface; unrelated registry map; map re-export only                            | An unrelated interface is recorded as augmentation wiring or a new extension bypasses owner review               |
| FR5–FR6, IR1–IR3 | Deterministic generation, pack test, and consumer parity tests       | clean write/check; stale artifact; packed Core; CLI without TypeScript; build/probe same lookup                                   | Generated bytes drift, absolute paths appear, TypeScript enters CLI dependencies, or consumers disagree          |
| FR7–FR10         | Root/media/adaptation validation matrix                              | built-in; closed custom; augmentation-wired root custom; rule-only custom; root laundering; open; unresolved; unknown target/prop | Unsupported finite values emit output, a root value launders a closed axis, or equivalent layers disagree        |
| FR11–FR12        | Version/absence compatibility fixtures                               | matching Core; older Core without artifact; unsupported schema; integration with/without contract                                 | CLI silently uses another version's facts or weakens Core validation because an integration is incomplete        |
| IR4              | Output-directory mutation tests                                      | malformed supported artifact; conflicting source evidence; missing/unsupported fallback                                           | Any output changes before failure, or fallback begins after partial output                                       |

### Completion criteria

This spec moves from `accepted` to `shipped` only when:

- every current Core target/visual-prop pair appears in the generated artifact;
- repository checks report finite, open, and unresolved counts without silent
  omissions;
- root, media-surface, and adaptation validation consume the same artifact;
- visual probes consume the same artifact instead of a separate alias resolver;
- every recorded augmentation path has current component-contract and focused
  fallback evidence;
- the packed Core package contains the checked artifact;
- the published CLI has no TypeScript runtime dependency; and
- existing themes with only built-in or valid augmentation-wired values build
  unchanged.

## Decision log

### DEC-1 — Derive selector domains at build time and publish the result

**Reference:** `spec:AST-031/DEC-1`
**Decider:** unassigned

TypeScript already owns binding and type semantics, while the CLI needs a small,
stable runtime contract. Running the compiler during repository builds preserves
that source of truth without adding compiler cost or complexity to every theme
build.

Rejected: parse `.doc.mjs` type strings at runtime. Those strings are consumer
documentation, not a complete binding graph, and unresolved aliases are
indistinguishable from intentional open domains.

Rejected: ship TypeScript in the CLI and inspect Core source on every build. That
adds substantial installation and cold-start cost while still leaving semantic
extension permission outside the type system.

Rejected: hand-maintain every finite allowed-value list. It duplicates the public
component types and creates a second value source that can drift.

### DEC-2 — Existing public augmentation paths become the enrollment signal

**Reference:** `spec:AST-031/DEC-2`
**Decider:** unassigned

A public augmentation interface consumed by a prop type proves the mechanical path
that existing theme builds use for generated declarations. Accepting this proposal
also accepts the audited existing set as the custom-value enrollment signal used
by validation. That acceptance is conditional on every existing path having the
current component-contract and fallback evidence required by
`architecture:component-theming-surface`; the artifact itself does not supply that
evidence. A future path remains an owner-reviewed API change with the same proof.

Rejected: label every interface ending in `Map` as an enrollment path. Registry
maps and interfaces outside a checked prop binding can share that syntax without
sharing component visual-prop semantics.

### DEC-3 — Unresolved is explicit, never equivalent to open

**Reference:** `spec:AST-031/DEC-3`
**Decider:** unassigned

A complete inventory can include entries whose domain is not yet mechanically
provable. Recording them keeps coverage honest and lets AST-012's compatibility
boundary remain narrow and measurable.

Rejected: omit unresolved axes or treat them as `string`. Both choices convert a
derivation gap into accidental API permission.

## Open questions

None. The owner decisions recorded above remain unassigned while this record is
`draft`; accepting the proposal assigns them without changing existing target
ownership, enrollment layers, warning severity, or package compatibility ranges.
