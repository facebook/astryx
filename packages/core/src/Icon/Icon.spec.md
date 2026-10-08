---
schema_version: 3
template_version: 3
kind: component
id: component:Icon
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/Icon/Icon.test.tsx,
    packages/core/src/IconButton/IconButton.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:public-component-api,
  ]
contributing: []
system_specs:
  [
    spec:AST-054/DEC-1,
    spec:AST-054/DEC-2,
    spec:AST-054/DEC-3,
    spec:AST-054/DEC-5,
    spec:AST-054/DEC-6,
    spec:AST-054/DEC-7,
    spec:AST-054/DEC-8,
    spec:AST-054/DEC-9,
  ]
---

# Icon component contract

## Intent

Icon presents one visual symbol with consistent size, color, and accessibility
semantics. Consumer usage remains documented in `Icon.doc.mjs`.

## Compatibility and migration

- Released defaults preserved: `xsm`, `sm`, `md`, and `lg` retain 12px, 16px,
  20px, and 24px dimensions; standalone Icon falls back to `md`.
- Compatibility class: fixed registry entries, namespaced keys, ordinary direct
  components, one-argument reads, and components/themes without capability fields
  keep their established behavior and pixels.
- Component-owned Icon roles may supply a contextual default. A metadata-bearing
  role may additionally receive a theme role-size override, while an explicit
  admitted Icon size remains authoritative.
- Migration decision: existing callers do not migrate. Libraries and component
  roles opt into capability participation explicitly.
- Controlled/uncontrolled behavior: not applicable.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Accepting a semantic icon key or a supplied icon component as the glyph source.
- Accepting optional, independent size, appearance, and weight requests admitted by
  the application icon-capability contract.
- Resolving explicit, theme role, component-owned contextual, and standalone size
  defaults, then applying the resolved icon-only dimension.
- Applying Icon's selected supplied version, size, color, theming target, and
  accessibility semantics to the rendered glyph.
- Preserving fixed ordinary direct components while recognizing explicitly adapted
  `IconType` components through Astryx-owned opaque participation metadata.

**Does not own / non-goals**

- The shared registry's source precedence, adaptive-entry grammar, application
  capability composition, role/state declarations, or theme presentation policy —
  owned by `spec:AST-054` and the linked architecture records.
- Which contextual default or effective state an owning Astryx component reports for
  its icon role — owned by that component or family contract.
- The meaning of a glyph in product context or whether nearby text makes it
  decorative — owned by the product callsite.
- Interaction, focus, state transitions, placement, or control naming — owned by the
  interactive parent.
- The artwork supplied by a consumer or registered through a theme.
- A public Icon size-provider API; contextual transport is implementation detail.

## Public concepts

| Concept       | Values or states                                                   | Meaning                                                      | Availability by variant/orientation/state  | Default                                                                            | Owner            | Stability | Invalid-value behavior                                                                                        |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| Glyph source  | semantic key, namespaced extension key, or icon component          | Selects the visual symbol and its fixed or adaptive source.  | Every render                               | Required                                                                           | `component:Icon` | Stable    | Unsupported built-in string values fail type checking; unresolved namespaced keys render no glyph.            |
| Size          | application capability size names                                  | Selects the icon box and optional size-specific artwork.     | Every rendered glyph                       | metadata-bearing theme role override, then component-owned default, otherwise `md` | `component:Icon` | Stable    | Static invalid values reject; an untyped invalid value warns in development and continues through fallback.   |
| Appearance    | appearance names admitted by the application capability set        | Selects one supplied visual version independently of weight. | Adaptive registry or adapted direct source | theme state/final-size policy, then selected source default                        | `component:Icon` | Stable    | Static invalid values reject; unsupported runtime requests use the selected source default and are inspected. |
| Weight        | named/numeric values or numeric ranges admitted by the application | Selects one supplied thickness independently of appearance.  | Adaptive registry or adapted direct source | theme policy for final size, then selected branch default                          | `component:Icon` | Stable    | Static invalid values reject; unsupported runtime requests use the selected branch default and are inspected. |
| Color         | documented semantic and palette values                             | Selects the glyph color or inherits it from context.         | Every rendered glyph                       | `inherit`                                                                          | `component:Icon` | Stable    | TypeScript rejects unsupported values.                                                                        |
| Accessibility | decorative or meaningfully labelled                                | Controls whether assistive technology receives the glyph.    | Every rendered glyph                       | Decorative                                                                         | `component:Icon` | Stable    | Empty labels use the decorative behavior.                                                                     |

An unresolved namespaced key renders nothing through `Icon`; `getIcon()` returns no
node, and `getExtendedIcon()` uses its caller-supplied fallback. Capability resolution
does not change those compatibility outcomes.

## Behavioral and layout contract

Requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Basis                                                                   | Review state                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| FR1 | Icon MUST present at most one glyph from the selected semantic key, namespaced key, or icon component. Fixed and adaptive registry entries, ordinary direct components, and explicitly adapted direct components remain distinct source modes.                                                                                                                                                                                                                                                                                                    | Documented promise, current tests, and `spec:AST-054/DEC-7`.            | Source baseline settled; adapted mode owned by cited decision.         |
| FR2 | Every rendered glyph MUST carry the `icon` theming target with its resolved size and selected color reflected as target data.                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source, docs, and theming tests.                                | Settled intent.                                                        |
| FR3 | Icon MUST apply the resolved dimension as width and height for every glyph, plus font size where needed for 1em-based icon sources. This sizing contract MUST NOT promise an HTML or SVG element type.                                                                                                                                                                                                                                                                                                                                            | Human decision, current source, and `spec:AST-054/DEC-2`.               | Local geometry settled; custom dimensions owned by cited decision.     |
| FR4 | Supported SVG and styling escape hatches MUST retain their established merge and override behavior. Capability requests MUST NOT change structure, color, accessibility, interaction, placement, focus, direction, or style-prop precedence.                                                                                                                                                                                                                                                                                                      | Current source, regression tests, and `spec:AST-054/FR14`.              | Current baseline; capability compatibility owned by cited requirement. |
| FR5 | An admitted explicit Icon `size` MUST win. Without one, Icon MUST use a theme role-size override for a metadata-bearing role, then the nearest default supplied by the owning component/family, then `md`. An untyped unadmitted consumer value is ignored, warns once in development, and continues through that cascade. The resolved name's nearest theme dimension or canonical dimension defines the box.                                                                                                                                    | `component:Icon/DEC-2`, `spec:AST-054/DEC-2`, and `spec:AST-054/DEC-9`. | Local defaults settled; theme role override owned by cited decision.   |
| FR6 | Optional `appearance` and `weight` requests MUST remain independent and authoritative. Appearance resolves before weight inside the selected source. The theme may supply default and final-size presentation plus appearance for one effective component state; state MUST NOT supply weight.                                                                                                                                                                                                                                                    | `spec:AST-054/DEC-5`, `spec:AST-054/DEC-6`, and `spec:AST-054/DEC-8`.   | Owned by cited decisions.                                              |
| FR7 | An explicitly adapted direct component MUST remain assignable to `IconType` and receive only admitted axes supported by its bound capability contract through opaque Astryx metadata. An ordinary direct component MUST receive no presentation props. A malformed adapter result MUST warn once in development and render the wrapped component without mapped presentation props.                                                                                                                                                               | `spec:AST-054/DEC-7`.                                                   | Owned by cited decision.                                               |
| FR8 | Capability mismatch MUST NOT throw during rendering. An untyped unadmitted appearance/weight value is not delivered and uses the selected source default. An admitted value unsupported by the selected adaptive branch uses that branch's default and later axes continue. Explicit caller mismatch warns once in development plus inspection; theme-policy fallback is inspection-only; production stays quiet. Fixed and ordinary direct sources ignore theme policy without warning and warn only for an explicit unsupported caller request. | `spec:AST-054/DEC-3`.                                                   | Owned by cited decision.                                               |

### Allowed variation

- **AV1 — Artwork.** The path, view box, internal structure, size branch,
  appearance, and weight may vary by supplied icon source or theme without changing
  Icon's one-part consumer anatomy.
- **AV2 — Rendering strategy.** Icon may render a fixed or adapted supplied icon
  component directly or use an internal wrapper for a resolved key; neither element
  shape is public anatomy.
- **AV3 — Theme and consumer styling.** Existing theme and styling escape hatches
  may change visual CSS properties without changing glyph ownership. Icon capability
  presentation selects supplied artwork rather than synthesizing or mutating SVG.
- **AV4 — Contextual mapping.** An owning Astryx component may map its own public
  size or variant to an Icon default and report one effective declared state. That
  structural policy belongs to the owner, preserves explicit Icon requests and the
  standalone fallback, and supplies neither appearance nor weight.

### Representative states

| State                                 | Required invariant                                                                 | Allowed variation                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Fixed semantic key                    | One resolved glyph carries the `icon` target.                                      | Theme, process registry, or built-in artwork.                 |
| Adaptive semantic key                 | One supplied version resolves inside one atomic selected entry.                    | Exact/root size branch, appearance branch, or weight version. |
| Namespaced extension key              | A resolved extension glyph carries the `icon` target.                              | Consumer- or library-owned fixed artwork.                     |
| Ordinary supplied icon component      | The supplied glyph stays fixed and receives no presentation props.                 | Component implementation and SVG internals.                   |
| Adapted supplied icon component       | The wrapped glyph receives only the admitted subset its bound contract supports.   | Integration-owned mapping and declared defaults.              |
| Standalone Icon without `size`        | The resolved size is `md` at the active theme's dimension.                         | Glyph source, appearance, weight, and color.                  |
| Metadata-bearing role without `size`  | Theme role override, then the documented component default, then `md` is used.     | The role's admitted theme or component default.               |
| `true` role without `size`            | The documented component default, then `md` is used.                               | No role-size or state-presentation participation.             |
| Explicit admitted Icon size in a role | The explicit Icon size wins over theme and component defaults.                     | Any admitted Icon size.                                       |
| Unresolved namespaced key             | `Icon` renders no glyph and programmatic reads preserve their documented fallback. | No capability fallback substitutes another key.               |

### Transformation and precedence order

- **ORD1 — Source and state input.** Icon receives one source and zero or one
  effective component state after caller source override and component-slot
  resolution. Registry precedence and role/state ownership stay with their linked
  architecture owners.
- **ORD2 — Size resolution.** Resolve admitted explicit Icon `size` → active-theme
  role override for a metadata-bearing role → nearest component/family default →
  standalone `md`; then resolve the active theme or canonical dimension.
- **ORD3 — Supplied version.** Inside the selected atomic source, appearance
  resolves explicit Icon request → theme appearance for the one effective role state
  → theme `default` plus matching final-size `bySize` appearance → selected source
  default. Weight resolves explicit Icon request → theme `default` plus matching
  final-size `bySize` weight → selected branch default. Unsupported appearance enters
  that branch's default and still evaluates weight; state never affects weight.
- **ORD4 — Presentation.** Apply the target, resolved size, selected supplied
  version, and component color styles, then merge consumer `xstyle`, `className`,
  inline `style`, and supported pass-through props in their established order.

### Performance and resources

- **PR1 — Render work.** Icon owns no listeners, observers, or layout
  measurement; semantic and size resolution are synchronous during render.

## Accessibility contract

- **AR1 — Decorative default.** Without a non-empty `label`, Icon MUST hide its
  glyph from assistive technology by default.
- **AR2 — Meaningful glyph.** A non-empty `label` MUST expose the glyph as an
  image with that accessible name.
- **AR3 — Parent-owned interaction.** Icon MUST NOT add interactive semantics or
  focus behavior; an interactive parent owns the control and its name.

## Design relationships

| Anatomy or state | Design requirement                                                 | Representation authority                                      | Hierarchy role    | Component contract |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------- | ------------------ |
| Glyph            | Carries the resolved visual symbol at the resolved size and color. | Consumer or registry selects artwork; Icon owns presentation. | Context-dependent | FR1, FR2, FR3, FR5 |

`Glyph` is the single conceptual consumer part in both source modes. Current
implementation may render a supplied icon component directly or place a
registry-resolved icon in an internal wrapper; this contract intentionally does
not promise a `span`, `svg`, or other element type.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Glyph": {"target": "icon"}
}
```

## Family and system relationships

- `architecture:component-size-cascade` owns the shared explicit → nearest
  provider → component fallback pattern and requires provider ownership to be
  declared. Icon keeps the four released dimensions and admits additional icon-only
  size names through `spec:AST-054/DEC-1` and `spec:AST-054/DEC-2`, not through the
  standard element-size axis.
- `architecture:component-theming-surface` owns qualification of the `icon` target
  and the separation between CSS target styling and non-CSS supplied-artwork
  selection.
- `architecture:icon-resolution-and-component-slots` owns semantic-key and
  component-slot source resolution, role metadata, and the effective state reported
  before Icon resolves presentation.
- `architecture:public-component-api` owns admission and compatibility rules for
  Icon's optional public requests and supporting types.
- `architecture:theme-authoring-contract`, `architecture:theme-application`, and
  `architecture:theme-compilation` own normalization, active-theme selection, and
  runtime/build parity for Icon capability data.
- `spec:AST-054/DEC-3`, `spec:AST-054/DEC-5`, `spec:AST-054/DEC-6`,
  `spec:AST-054/DEC-7`, and `spec:AST-054/DEC-8` own mismatch behavior,
  one-direction resolution, public appearance intent, adapted direct sources, and
  theme presentation.
- The owning component or family specifies each contextual Icon-size mapping and
  state transition. The Button family maps `sm` and `md` controls to `sm` Icons and
  `lg` controls to `md` Icons as its structural default.
- Icon has no current family contract.

## Verification map

| Contract            | Verification                                                                                   | Representative states                                                                                  | Mutation or failure expectation                                                                                                                                              | Audit section              |
| ------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1, FR3, FR5       | `Icon.test.tsx` sizing/source suites, contextual-size suites, and capability resolver fixtures | standalone and role defaults; admitted/untyped sizes; fixed/adaptive registry; ordinary/adapted direct | Source identity, released dimensions, standalone fallback, role cascade, explicit precedence, or resolved-box sizing changes.                                                | `audit:Icon/behavior`      |
| FR2, FR4            | `Icon.test.tsx` target/styling suites plus source inspection                                   | every source mode; size/color variants; presentation present/absent                                    | Target/styling composition changes, capability selection changes structure/color/a11y, or default pixels drift; `data-color` still lacks focused assertions.                 | `audit:Icon/theming`       |
| FR6, FR8            | Resolver, browser, inspection, and diagnostics matrix fixtures                                 | explicit/theme appearance and weight; one effective state; fixed source; supported/unsupported branch  | State changes weight, explicit intent loses, theme fallback logs, mismatch throws, production warns, or inspection reports the wrong request/fallback.                       | `audit:Icon/behavior`      |
| FR7                 | Type, ordinary-direct, adapted-direct, and malformed-adapter fixtures                          | unsupported explicit/theme axes; valid mapping; malformed mapping                                      | Adapted exports stop satisfying `IconType`, unsupported axes leak, ordinary components receive presentation props, or malformed mapping fails to render the wrapped default. | `audit:Icon/behavior`      |
| AR1, AR2, AR3       | `Icon.test.tsx` accessible-name suites                                                         | Decorative, labelled, explicit ARIA override                                                           | Changing default or labelled semantics fails accessibility assertions.                                                                                                       | `audit:Icon/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                  | Canonical consumer anatomy and current target                                                          | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                      | `audit:Icon/theming`       |

Focused coverage for `data-color` on both glyph source modes is a checkable test
gap; source inspection is the current evidence for that part of FR2.

The AST-054 capability props, adaptive resolver, adapter path, diagnostics, and
corresponding verification rows are accepted but unshipped. The released fixed source,
size, color, anatomy, styling, and accessibility paths remain the implemented
baseline.

## Decision log

### DEC-1 — One conceptual Glyph across source modes

**Reference:** `component:Icon/DEC-1`
**Decider:** cixzhang, 2026-08-30

Consumers theme and reason about one visual symbol regardless of whether it
comes from a semantic key or a supplied component. `Glyph` therefore maps to the
existing `icon` target without freezing either mode's current element shape.
Icon applies width and height for every source and adds font size where a 1em-
based source needs it. This preserves one consistent icon box without promising
a `span`, `svg`, or other element.

Rejected: separate wrapper and SVG anatomy entries, because those describe
implementation strategies rather than stable consumer concepts.

### DEC-2 — Owning components may provide contextual Icon defaults

**Reference:** `component:Icon/DEC-2`
**Decider:** cixzhang, 2026-09-23

A person should see an icon that is proportionate to the Astryx component that
owns its slot without every caller repeating a size. The owning component may
therefore provide the default while an explicit Icon size remains authoritative
and a standalone Icon remains `md`. Provider objects, hooks, and context shape
remain private implementation details rather than public API.

Rejected: an unconditional `md` default inside every composition, forcing every
caller to repeat the owner-derived size, and exposing the provider mechanism as
public API.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.
