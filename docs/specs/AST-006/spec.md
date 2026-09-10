---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-006
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
phase: shipped
owners: [cixzhang, rubyycheung, imdreamrunner]
affects_architecture:
  [
    architecture:theme-authoring-contract,
    architecture:theme-tokens,
    architecture:theme-compilation,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Theme-local tokens system spec

## Intent

Let a maintained theme reuse one of its own semantic decisions across component
overrides without adding that decision to Astryx's portable token vocabulary.
Theme authors get one explicit, checked path for theme-family-local reuse;
component and application authors keep the same portable token contract they have
today.

The shipped API is one optional `DefineThemeInput.localTokens` field. Supplying
it explicitly enrolls a theme in the new contract; omitting it preserves existing
behavior, even when legacy component overrides already mention
`--astryx-theme-*`. A local token is declared with its complete CSS
custom-property name and referenced by that same name in the defining theme's
component overrides. Descendants inherit enrollment and may replace exact names
only through an enrolled exact `extends` lineage. Mere emitted CSS creates no
contract, but a shipped enrolled definition recorded by its owning theme spec
does: its exact name and semantic meaning are public within that theme family,
not portable across themes or intended for Core component source.

This current record governs the shipped cross-theme API and invariants
independently of whether any particular theme has completed its own adoption
evidence. Theme-local names, meanings, values, mappings, and rendered evidence
remain owned by each adopting theme's colocated record.

## Non-goals

- Changing the type, accepted inputs, runtime or build behavior, permissive
  spread behavior, names, precedence, inheritance, output, or resolution of the
  existing `DefineThemeInput.tokens` path.
- Adding a `defineLocalTokens` helper, a second authoring operation, a shorter
  role identifier, a reference alias, or a parallel local-token API.
- Adding theme-local names to `TokenName`, `tokenVar`, `tokenVars`,
  `resolveThemeToken`, generated portable token documentation, or Core component
  source.
- Creating an application-consumer token extension mechanism. A compiled custom
  property is an implementation output of its maintained theme family, not
  authorization for application code to depend on it.
- Defining any adopting theme's role meaning, value, component mappings, or
  evidence. Those belong to that theme's colocated record.

## Requirements

The requirements below are the shipped cross-theme contract.

- **FR1 — Local tokens are purely additive, optional, and explicitly enrolled.**
  `DefineThemeInput` MUST gain at most one new authoring surface: optional
  `localTokens`. Supplying `localTokens` explicitly enrolls that theme in the new
  contract. A descendant inherits enrollment only by extending an enrolled exact
  base. A theme that neither supplies the field nor extends an enrolled exact
  base remains unenrolled and MUST produce byte-equivalent `DefinedTheme` data,
  runtime behavior, static output, package output, and resolution behavior.
- **FR2 — Existing token behavior is frozen and local values reuse its value
  contract.** This contract MUST NOT change `tokens` typing, accepted inputs,
  runtime handling, static handling, permissive unknown-key or broad-spread
  behavior, names, precedence, inheritance, output, or resolution. Existing
  casts, spreads, external CSS variables, and legacy token references MUST NOT
  receive new warnings, failures, reinterpretation, or migration requirements.
  Inside the opt-in `localTokens` field, each value MUST accept the complete
  existing `TokenValue` contract: a CSS string or `[light, dark]` tuple. Runtime
  and static build MUST apply the same value normalization semantics existing
  `tokens` use, without changing that existing path or normalizing theme names.
- **FR3 — One exact name survives every stage.** A local token declaration MUST
  use its complete CSS custom-property name as the `localTokens` key. The same
  exact string MUST be used in `var(...)` references, `DefinedTheme` data,
  runtime CSS, static CSS, inherited replacement, and generated theme-specific
  types or metadata. No transform may create a second identifier.
- **FR4 — Enrollment requires an exact stable theme name.** A theme supplying
  `localTokens` MUST already have a `DefineThemeInput.name` that is a valid,
  stable, lower-kebab theme identifier. No hidden normalization or rewritten
  namespace is allowed. Every newly declared name MUST follow
  `--astryx-theme-${name}-<purpose-led Astryx token grammar>`, using the input
  `name` byte-for-byte. The suffix MUST be purpose-led and lowercase kebab-case.
  Generic semantic domains such as `color`, `spacing`, `radius`, or `motion` are
  valid inside the theme namespace. Existing themes with other name shapes
  remain valid while unenrolled.
- **FR5 — Local use stays inside the maintained theme family.** A local name MAY
  be referenced by the maintained enrolled theme that defines it and by
  descendants enrolled through its exact `extends` lineage. It MUST NOT become a
  portable cross-theme token or a dependency in Core component source. Mere CSS
  emission from an unenrolled legacy path creates no contract. Once an enrolled
  theme ships a local token documented in its colocated theme-level spec, the
  exact name and semantic meaning ARE a public compatibility contract of that
  theme family.
- **FR6 — Extension is exact-name, enrollment, and lineage-aware.** A descendant
  inherits enrollment and declarations only from an enrolled exact `extends`
  base. It MAY replace an inherited local token only by restating that inherited
  complete name. A new local role declared by the descendant MUST use the
  descendant's exact stable `name`. Arbitrary legacy names, matching prefixes,
  matching suffixes, or coincidental values MUST NOT be retroactively claimed as
  lineage. A child MUST NOT forge another theme's namespace.
- **FR7 — Validation is atomic for enrolled themes only.** Runtime and static
  build MUST share one recursive validator. For a theme enrolled directly or
  through an enrolled exact base, it MUST validate the enrolled lineage's exact
  namespaces, declarations, and every `var(--astryx-theme-...)` reference
  reachable through local-token values, component overrides, nested pseudo
  rules, and media-surface component overrides. It MUST reject malformed local
  names, undeclared enrolled references, cyclic local references, exact-name or
  lineage mismatch, and foreign local declarations before producing partial
  output.
- **FR8 — Unenrolled legacy behavior is grandfathered unchanged.** When
  `localTokens` is absent and the exact base is not enrolled, runtime and static
  build MUST NOT scan, reject, warn about, reserve, or reinterpret
  `--astryx-theme-*` strings that already appear in token values or component
  overrides. Existing same-prefix custom properties continue unchanged. A
  maintainer may leave that legacy behavior unenrolled, or explicitly migrate by
  supplying `localTokens` and declaring every reserved local name used by the
  enrolled theme. Variables outside the reserved namespace and every existing
  portable-token path remain untouched in either state.
- **FR9 — Source and built themes preserve one enrollment lineage.**
  Source-defined and built themes MUST retain equivalent exact local-token maps,
  enrollment state, and lineage metadata so descendants accept, inherit,
  replace, reject, and emit the same names without requiring a base stylesheet.
- **FR10 — Released names and meanings are compatibility obligations.** Once an
  enrolled local token ships, its exact name and documented semantic meaning are
  public contracts of the owning theme family. Renaming the local token or its
  enrolled theme, or changing that meaning, MUST use an explicit reviewed
  migration or alias that preserves the prior exact-name, meaning, and lineage
  contract for its compatibility window. Silent key replacement, semantic
  broadening, theme-name rewriting, namespace rewriting, and inferred descendant
  migration are prohibited.
- **FR11 — The colocated theme spec owns definitions and mappings.** Each
  theme-local token definition MUST live in the owning theme's colocated
  theme-level spec, including its exact name, semantic meaning, value, mappings,
  compatibility, and rendered evidence. A long generated name is acceptable when
  it accurately names the meaning shared by every context where it is applied.
  Adding a mapping is a theme-spec compatibility review: the context MUST
  genuinely match the documented meaning and MUST provide rendered evidence for
  its actual light/dark and relevant interaction states.

### Shipped authoring shape

`defineTheme` remains the only authoring operation. Opt-in requires the existing
`name` to already be the exact lower-kebab identifier used in every local token.
The same complete local name is declared, referenced, preserved in
`DefinedTheme`, inherited, and emitted:

```ts
const exampleTheme = defineTheme({
  name: 'example',
  localTokens: {
    '--astryx-theme-example-color-status-fill-accent': ['#0074e2', '#6d9cfe'],
  },
  components: {
    badge: {
      'variant:info': {
        backgroundColor: 'var(--astryx-theme-example-color-status-fill-accent)',
      },
    },
  },
});
```

The declaration key and the name inside `var(...)` are identical. The tuple uses
the complete existing `TokenValue` contract and normalizes exactly as an existing
`tokens` light/dark tuple does. Runtime and static compilation emit
`--astryx-theme-example-color-status-fill-accent` without shortening or
renaming it. An adopting `theme:*` record owns its concrete role, value, and
component mapping.

### Platform support

- Supported feature/engine floor: the same CSS custom-property,
  `light-dark()`, theme scope, and browser support as existing web themes.
- Unsupported behavior: a platform compiler that cannot preserve a local role
  and its lineage MUST reject that enrolled input clearly rather than silently
  omit it or expose the CSS spelling as shared cross-platform API.
- Browser evidence: each adopting theme verifies its actual component mappings
  and color modes in real Chromium. Name, validation, inheritance, and
  runtime/static parity are structural and testable without visual evidence.

## Current-state impact

Current `main` keeps its closed portable core/domain token vocabulary and now
ships a separate first-class local-token field. Unknown keys that reach
permissive legacy paths can still serialize, but only explicit `localTokens`
enrollment creates ownership, reference closure, and lineage validation.

- `architecture:theme-authoring-contract` owns the optional `localTokens`
  input, its exact-name map, explicit enrollment state, flattened inheritance,
  and lineage metadata;
- `architecture:theme-compilation` emits that exact map through the shared
  runtime/static compiler and applies one recursive validator only to themes
  enrolled directly or through an enrolled exact base; and
- `architecture:theme-tokens` continues to own the unchanged portable
  vocabulary and explicitly excludes theme-local names from its public helpers
  and documentation.

Those current architecture records are authoritative for the shipped behavior
and cite the applicable AST-006 decisions. A draft theme record may reference
this current spec while keeping its own value, mapping, and evidence decisions
unresolved.

### Compatibility and adoption

- Adoption is per maintained theme family and optional. Existing themes are not
  migrated merely because the field exists.
- A theme that omits `localTokens` and does not extend an enrolled exact base
  remains byte-equivalent across `DefinedTheme`, runtime, static, and package
  outputs. Existing component overrides that mention `--astryx-theme-*` receive
  no new scan, rejection, warning, reservation, or interpretation.
- An existing same-prefix custom property may continue unchanged while the theme
  remains unenrolled. To migrate, the maintainer explicitly supplies
  `localTokens`, declares every reserved local name used by that theme, and uses
  a valid stable lower-kebab `name` whose bytes match the namespace.
- Existing `tokens` and external-variable behavior remains byte-equivalent,
  including permissive broad spreads and runtime inputs.
- Local names and documented meanings become public theme-family compatibility
  obligations after release; they never become portable cross-theme or global
  Core token promises. Mere custom-property emission from an unenrolled legacy
  path does not create that contract.
- Each local definition and mapping lives in the owning package's colocated theme
  spec. Every new mapping reviews whether its context genuinely matches the
  documented meaning and supplies rendered evidence before adoption.
- Descendant compatibility follows explicit enrollment and exact lineage. A
  released enrolled theme or token rename, or semantic meaning change, requires
  an explicit migration or alias before descendants move.
- The infrastructure implementation carries its own Changeset. A later adopting
  theme output change carries a separate release note.

## Verification

| Contract      | Verification                                                                   | Representative states                                                                                                                        | Mutation or failure expectation                                                                                             |
| ------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2, FR8 | Legacy type, runtime, build, resolution, and byte-output fixtures              | omitted field; legacy `--astryx-theme-*` component reference; direct tokens; broad spread; cast; external variable; portable reference       | Adding a reserved-namespace scan to the omitted-field path makes the legacy same-prefix mutation fixture fail.              |
| FR2           | Local `TokenValue` parity fixtures                                             | CSS string; `[light, dark]` tuple; reference value; runtime/static normalization; existing-token control                                     | Local values reject an existing form, normalize differently across paths, or alter the existing `tokens` control.           |
| FR3, FR4      | Exact-name authoring, type, and output fixtures                                | valid lower-kebab exact name; invalid input name; declaration key; `var(...)` reference; `DefinedTheme`; runtime CSS; static CSS             | Any stage rewrites `name`, accepts a mismatched namespace, or changes existing name acceptance while unenrolled.            |
| FR5, FR6, FR9 | Source- and built-base enrollment/lineage fixtures                             | root opt-in; child inherits enrolled exact base; child exact replacement; child new role; unenrolled base; unrelated/legacy matching prefix  | A child gains lineage from an unenrolled or unrelated name, or source/built enrollment differs.                             |
| FR7, FR8      | Shared recursive validator fixtures for runtime and static build               | enrolled nested references; component/pseudo/media rules; undeclared name; cycle; foreign namespace; unenrolled same-prefix legacy reference | Enrolled errors emit partial output, paths disagree, or the same scan runs on an unenrolled theme.                          |
| FR8           | Explicit legacy-enrollment migration fixture                                   | same-prefix var omitted and accepted; then declared in `localTokens` and validated                                                           | Omitted legacy behavior changes, or explicit enrollment fails to bring the declaration/reference into the checked contract. |
| FR10, FR11    | Theme-package compatibility fixtures, colocated theme spec, and release review | exact name; documented meaning; enrolled theme rename; local-token rename; meaning change; alias window; descendant built from old/new base  | A released name or meaning changes silently, a definition lacks an owner, or a descendant loses its inherited contract.     |
| FR11          | Per-mapping theme-spec review plus focused rendered evidence                   | exact role meaning; mapped components/states; light/dark; relevant interaction states                                                        | A mapping uses the token outside its documented meaning or ships without contextual rendered evidence.                      |

### Completion criteria

AST-006 is `shipped` because the implementation satisfies these criteria:

- optional `DefineThemeInput.localTokens` is the only new local-token authoring
  surface and its presence is the root enrollment trigger;
- a theme with no `localTokens` and no enrolled exact base is proven
  byte-equivalent, including a mutation fixture whose legacy component override
  mentions `--astryx-theme-*` without any new scan, rejection, or warning;
- local values accept both existing `TokenValue` forms—a CSS string and
  `[light, dark]` tuple—and runtime/static normalization matches the existing
  `tokens` value path without changing it;
- opt-in requires the existing input `name` to already be a stable lower-kebab
  identifier, and one exact local name preserves those bytes through declaration,
  `var(...)` use, `DefinedTheme`, source/built inheritance, and emitted output;
- descendants inherit enrollment only from an enrolled exact base; arbitrary
  legacy names are never retroactively claimed;
- namespace, exact-lineage, undeclared-reference, malformed-name, and cycle
  failures are atomic and equal across runtime and static paths for enrolled
  themes only;
- built themes retain enrollment and exact lineage metadata sufficient for
  descendants without a base stylesheet;
- every shipped local definition is owned by its colocated theme-level spec, and
  its exact name and semantic meaning are treated as public compatibility
  contracts within that theme family;
- every added mapping passes theme-spec compatibility review and rendered
  light/dark and relevant interaction-state evidence showing that its context
  genuinely matches the documented meaning;
- public portable token types, helpers, docs, and Core component source do not
  expose local names as cross-theme API; and
- each adopter's colocated `theme:*` record owns its names, meanings, values,
  mappings, migration, and rendered evidence.

## Decision log

The decisions below were approved by `cixzhang` as part of this current shipped
specification.

### DEC-1 — Add one optional local-token field without changing tokens

**Reference:** `spec:AST-006/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Use a purely additive optional `DefineThemeInput.localTokens` field. Supplying
it explicitly enrolls a theme; an exact descendant may inherit that enrollment
from an enrolled base. Keep `defineTheme` as the only authoring operation and
preserve every existing `tokens` type, input, runtime, build, spread, precedence,
inheritance, output, and resolution behavior. A theme with no `localTokens` and
no enrolled exact base remains byte-equivalent even when existing component
overrides mention `--astryx-theme-*`.

Rejected: a `defineLocalTokens` helper, parallel API, implicit enrollment from a
matching prefix, module augmentation of the portable token vocabulary, or
stricter validation on existing token paths.

### DEC-2 — Use one exact theme-owned name through definition and use

**Reference:** `spec:AST-006/DEC-2`
**Decider:** `cixzhang`, `2026-08-31`

To enroll, the existing `DefineThemeInput.name` must already be a stable
lower-kebab identifier. A new local name uses
`--astryx-theme-${name}-<purpose-led Astryx token grammar>`, copying that name
byte-for-byte with no hidden normalization. The declaration key is the CSS
variable, and component overrides use that same name in `var(...)`. Generic
domains such as `color` and `spacing` remain valid inside the owning theme
namespace. Existing themes with other name forms remain valid while unenrolled.

Rejected: normalizing or rewriting the input name, shorter role ids, generated
names, reference aliases, and treating a generic domain word as a collision with
portable tokens.

### DEC-3 — Bind replacement to exact extension lineage

**Reference:** `spec:AST-006/DEC-3`
**Decider:** `cixzhang`, `2026-08-31`

A descendant inherits enrollment only from an enrolled exact `extends` base and
may replace an inherited exact name only when that name arrived through that
lineage. Every new descendant role uses the child's exact stable input `name`.
Source and built themes retain equivalent enrollment and lineage metadata.
Arbitrary legacy names are never retroactively claimed. Released enrolled theme
or token renames require an explicit migration or alias.

Rejected: foreign namespace declarations, suffix- or prefix-based enrollment,
value-based lineage inference, and silent theme-name or namespace rewriting
during extension.

### DEC-4 — Validate only the new reserved local namespace

**Reference:** `spec:AST-006/DEC-4`
**Decider:** `cixzhang`, `2026-08-31`

Runtime and static build share one exact validator. It recursively rejects
malformed local declarations, undeclared or cyclic reserved local references,
and namespace or lineage errors only after a theme is enrolled directly through
`localTokens` or through an enrolled exact base. An unenrolled theme receives no
reserved-prefix scan, rejection, or warning, even when legacy component
overrides mention `--astryx-theme-*`. Existing portable tokens, permissive
spreads, casts, unknown-key behavior, and external variables remain untouched.
A legacy same-prefix variable either continues unchanged while omitted or enters
the checked contract through explicit declaration in `localTokens`.

Rejected: a global reserved-prefix scan, a broad CSS-variable validator, or
using the new field to close legacy runtime permissiveness.

### DEC-5 — The owning theme spec defines a public theme-family contract

**Reference:** `spec:AST-006/DEC-5`
**Decider:** `cixzhang`, `2026-08-31`

Theme-local token definitions belong in the owning package's colocated
theme-level spec. Once shipped, the exact token name and semantic meaning are a
public compatibility contract within that maintained theme family, even though
the token is not portable across themes and is not intended for Core component
source. Mere output from an unenrolled legacy path is not enough; explicit
enrollment, shipment, and the theme spec establish the contract.

A long generated name is acceptable when it accurately describes every context
where the theme applies it. Adding any mapping is therefore a theme-spec
compatibility review: the context must genuinely mean the documented role and
must carry rendered evidence for its actual light/dark and relevant interaction
states.

Rejected: treating local names as either global portable tokens or disposable
implementation details, defining them outside the owning theme spec, and reusing
a name in contexts that only happen to share a value.

### DEC-6 — Reuse the complete existing `TokenValue` contract

**Reference:** `spec:AST-006/DEC-6`
**Decider:** `cixzhang`, `2026-08-31`

`localTokens` accepts the complete existing `TokenValue` contract: a CSS string
or `[light, dark]` tuple. Inside the new opt-in field, both runtime and static
build apply the same value normalization semantics existing `tokens` use. This
reuses one established light/dark authoring model without changing the existing
`tokens` path or introducing another value shape.

Rejected: limiting local values to CSS strings only or defining local-specific
mode syntax and normalization.

## Open questions

None at the cross-theme API level. Adopting theme specs may retain checkable
rendered-evidence gates; their ownership, exact names, and semantic meanings are
not re-opened by those gates.
