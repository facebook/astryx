---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-014
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, rubyycheung, imdreamrunner]
affects_architecture:
  [
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
affects_families: [family:input-fields, family:overlay-dismissal]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs:
  [
    AppShell,
    ComplexSelector,
    ContextMenu,
    DateInput,
    DateTimeInput,
    DropdownMenu,
    HoverCard,
    MoreMenu,
    MultiSelector,
    Selector,
    TimeInput,
    Tooltip,
  ]
---

# Responsive surface adaptations system spec

## Intent

Give components one predictable API for caller-owned surface selection across
viewport and pointer conditions without multiplying device-specific props or
requiring consumers to recreate media-query state in React.

The API is named `adaptations`, following the environmental-adaptation vocabulary
accepted by [AST-012](../AST-012/spec.md). Omitting the prop uses the component's
built-in recommended policy. The string value `"default"` explicitly restores
that policy, including after a props spread. A policy object replaces the
built-in policy with a default surface and ordered conditional rules.

```ts
type WidthBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type SurfaceAdaptations<Surface extends string> = {
  default: Surface;
  rules?: Array<{
    from?: WidthBreakpoint;
    below?: WidthBreakpoint;
    pointer?: 'coarse' | 'fine';
    value: Surface;
  }>;
};

adaptations?: 'default' | SurfaceAdaptations<ComponentSurface>;
```

`ComponentSurface` is component-qualified. Selector may support `popover` and
`bottom-sheet`; DateInput may additionally support `native`; TimeInput instead
needs `typed` and `native`. Components share a literal only when it makes the
same observable promise.

## Non-goals

- Shipping the runtime API or changing current component defaults in this
  specification-only pull request.
- Making every responsive behavior caller-configurable. Components still derive
  touch target sizing, viewport fit, wrapping, and other safe defaults.
- Reusing theme adaptation values to select component structure. AST-012 owns
  CSS-first theme values; this record owns component surface selection in React.
- Accepting raw media queries, arbitrary breakpoint names, or user-defined
  condition fields.
- Requiring every component to support the same surface literals or built-in
  policy.
- Treating viewport width as device identity or using `mobile`, `isMobile`, or
  `mobileMode` as generic responsive API names.
- Renaming Tooltip or HoverCard's `touchTrigger`; it controls activation rather
  than the rendered surface.
- Renaming the `MobileNav` component or AppShell's `mobileNav` feature slot.
- Removing released `presentation` or `nativePicker` props without a separately
  reviewed compatibility window and release plan.

## Requirements

- **FR1 — One rendered outcome has one public owner.** A component MUST NOT
  expose parallel forward APIs that independently select mutually exclusive
  interaction surfaces. `adaptations` owns both the baseline surface and any
  environment-conditioned replacements.
- **FR2 — Omission uses component policy.** Omitting `adaptations` or passing
  `undefined` MUST use the component's documented built-in recommended policy.
  The policy may differ between components because supported tasks and surfaces
  differ.
- **FR3 — `default` is an explicit reset.** `adaptations="default"` MUST select
  the same built-in policy as omission. This sentinel exists so a caller can
  restore component policy after a props spread without reconstructing it.
- **FR4 — A policy object replaces the built-in policy.** An object MUST begin
  from its required `default` surface and evaluate only its own rules. It MUST
  NOT merge with hidden rules from the component's built-in policy.
- **FR5 — Conditions are conjunctive and ordered.** `from`, `below`, and
  `pointer` conditions present in one rule are ANDed. Rules evaluate in authored
  order, and the last matching rule wins. Condition shape creates no independent
  specificity score. A rule MUST contain at least one condition; duplicate
  condition sets are valid and retain their authored order.
- **FR6 — Width semantics come from AST-012.** `from` is inclusive, `below` is
  exclusive, and both use AST-012's fixed `sm | md | lg | xl | 2xl` names. A
  bounded rule MUST resolve to `from < below`. Resolution uses the effective
  `widthBreakpoints` from the nearest Theme; without provider context it follows
  the root-theme fallback, and with no active theme it uses AST-012's defaults.
- **FR7 — Pointer means primary-pointer precision.** `pointer` accepts only
  `coarse | fine` and follows the primary-pointer media feature. It MUST NOT use
  hover support or a user-agent device label as a substitute.
- **FR8 — Surface choice is stable while open.** A component resolves its policy
  when an interaction opens and MUST keep that surface for the presented
  lifetime. A resize, theme change, or pointer-capability change MUST NOT replace
  the active surface underneath the user.
- **FR9 — Surface names are observable promises.** A concrete surface value MUST
  request that surface independent of environment. A component MAY use a
  documented fallback when the requested surface cannot preserve another public
  contract or is unsupported by the platform; it MUST NOT silently substitute a
  different surface merely because another one is preferred.
- **FR10 — Component surface sets stay qualified.** Public component types MAY
  share internal rule machinery, but consumers MUST NOT need to import an
  unrelated component's surface type. A component omits surfaces it cannot
  render.
- **FR11 — Released inputs migrate without hidden precedence.** During a
  compatibility window, types SHOULD prevent supplying `adaptations` with a
  legacy `presentation` or `nativePicker` prop. Runtime handling MUST diagnose an
  invalid combination and MUST NOT select one through undocumented precedence.
- **FR12 — Visual treatment and activation remain separate.** `variant` changes
  visual treatment without selecting a mutually exclusive interaction surface.
  `touchTrigger` changes activation without selecting a different surface.

### Public API requirements

- **API1 — Shared policy shape, component-qualified surface values.** A component
  adopting this contract SHOULD export a local type such as
  `SelectorAdaptations` or `DateInputAdaptations`. Its public shape is:

  ```ts
  type SelectorSurface = 'popover' | 'bottom-sheet';

  type SelectorAdaptations =
    | 'default'
    | {
        default: SelectorSurface;
        rules?: Array<{
          from?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
          below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
          pointer?: 'coarse' | 'fine';
          value: SelectorSurface;
        }>;
      };
  ```

  Implementations MAY share generic internal types and a resolver. Public
  component subpaths own their qualified aliases.

- **API2 — Popover/sheet components.** Selector, MultiSelector, DropdownMenu,
  MoreMenu, ContextMenu, and eligible ComplexSelector paths use `popover` and
  `bottom-sheet`. Their intended built-in policy starts from `popover` and uses
  `bottom-sheet` below `md` when the primary pointer is coarse:

  ```tsx
  <Selector label="Country" value={country} onChange={setCountry} />

  <Selector {...fieldConfiguration} adaptations="default" />

  <Selector
    label="Country"
    value={country}
    onChange={setCountry}
    adaptations={{
      default: 'popover',
      rules: [
        {
          below: 'md',
          pointer: 'coarse',
          value: 'bottom-sheet',
        },
      ],
    }}
  />
  ```

  Compound-child paths that support only Popover MUST NOT claim the broader
  surface set until they can preserve their composition contract on BottomSheet.

- **API3 — DateInput and DateTimeInput preserve three released policies.** Their
  surface vocabulary includes `popover | bottom-sheet | native`. A migration
  from `nativePicker` MUST preserve these observable mappings:

  - `touch` maps to the built-in policy: the platform-owned picker on a coarse
    primary pointer and the Astryx pointer path on a fine primary pointer.
  - `always` maps to `{default: 'native'}`, subject to documented feature and
    platform fallbacks.
  - `never` maps to an Astryx-only policy: `popover` by default and
    `bottom-sheet` on a coarse primary pointer.

  DateTimeInput's `popover` value names its Astryx fine-pointer path, including
  the typed segments and the popovers those segments open. Its `bottom-sheet`
  value names the coordinated Date/Time sheet.

- **API4 — TimeInput keeps its typed-field path explicit.** TimeInput MUST NOT be
  grouped with the DateInput and DateTimeInput `never` mapping. Its surface
  vocabulary is `typed | native`, and its released mappings are:

  - `touch` maps to the built-in policy: `native` on a coarse primary pointer
    and `typed` on a fine primary pointer.
  - `always` maps to `{default: 'native'}`.
  - `never` maps to `{default: 'typed'}` on both coarse and fine pointers.

  `hasSeconds` or a non-default `increment` continues to retain the typed field
  when the native picker cannot preserve those contracts. This is a documented
  fallback under FR9, not a coarse-pointer BottomSheet policy.

- **API5 — Legacy presentation values map without loss.** For components that
  currently expose `presentation`, an implementation migration preserves:

  - `popover` as `{default: 'popover'}`;
  - `bottom-sheet` as `{default: 'bottom-sheet'}`; and
  - `adaptive` as `"default"` when the component's built-in policy is the same
    compact coarse-pointer policy.

  The release plan MUST separately decide when omission changes from any current
  compatibility default to the built-in recommended policy defined by FR2.

- **API6 — Theme adaptations and component adaptations share conditions, not
  values.** This API reuses AST-012's breakpoint names, boundary semantics,
  effective Theme lookup, pointer vocabulary, conjunction, and authored-order
  precedence. It intentionally uses a compact surface rule with top-level
  `from`, `below`, and `pointer` rather than AST-012's theme-value
  `{when, value}` shape: a component rule assigns one closed surface value rather
  than a partial theme object. Components do not read or inherit
  `theme.adaptations.rules` to select structure.

- **API7 — Existing specialized names stay separate.** Tooltip and HoverCard
  retain `touchTrigger?: 'auto' | 'tap' | 'none'`. AppShell retains `mobileNav`
  because it configures the concrete MobileNav feature. Renaming the released
  `defaultIsMobile` SSR hint is outside this spec's implementation scope.

### Platform support

- Supported feature/engine floor: every browser supported by Astryx Core with
  the existing media-query, Popover, BottomSheet, native-input, and fallback
  contracts of each owning component.
- Unsupported behavior: policies MUST NOT depend on user-agent device labels.
  Components preserve their documented fallback when a requested platform
  surface is unavailable or cannot express a required feature.
- Browser evidence: component-policy behavior requires real Chromium coverage at
  breakpoint edges and coarse/fine pointer states. Native picker behavior that
  differs by engine requires real Safari/iOS or Android evidence; Playwright
  WebKit is not a substitute for Safari.

## Current-state impact

AST-012 is current and already owns the environmental vocabulary used here:
`adaptations`, the five named width breakpoints, inclusive `from`, exclusive
`below`, conjunctive conditions, and authored-order precedence. It explicitly
leaves responsive component behavior to a separate owner. This record fills that
boundary without making component structure consume CSS theme rules.

Current responsive component APIs fall into three groups:

1. Selector, MultiSelector, DropdownMenu, MoreMenu, ContextMenu, and pending
   ComplexSelector work use `presentation` with
   `popover | bottom-sheet | adaptive`.
2. DateInput, DateTimeInput, and TimeInput use the released `nativePicker` prop,
   but TimeInput's Astryx-owned path is always a typed field and does not gain the
   date components' coarse-pointer BottomSheet.
3. Tooltip and HoverCard use `touchTrigger` for activation, while AppShell uses
   `mobileNav` for a concrete feature and `defaultIsMobile` as an SSR hint.

If accepted, implementation pull requests update the current public-component
API and contributor guidance, affected component records, public types, consumer
docs, tests, examples, and Changesets. The pending ComplexSelector presentation
work must reconcile with the accepted contract before shipping. Current
component behavior and defaults remain authoritative until those changes land.

## Verification

| Contract       | Verification                                               | Representative states                                                                     | Mutation or failure expectation                                                                   |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FR1–FR5, API1  | Policy resolver unit tests and public type fixtures        | omitted, `undefined`, `default`, baseline, overlap, no match, later match                 | Built-in rules leak into a replacement, reset differs from omission, or ordering changes          |
| FR6–FR8, API6  | Theme integration and open-lifetime interaction tests      | every breakpoint edge, nearest/root/no Theme, coarse/fine, resize while open              | Width semantics drift from AST-012 or an open interaction changes surface                         |
| FR9–FR10, API2 | Component surface and unsupported-path tests               | popover, bottom-sheet, compound children, unsupported requested surface                   | A literal changes meaning, an unsupported surface is exposed, or fallback is silent               |
| FR11, API3–5   | Compatibility tests, type fixtures, and migration examples | every legacy value, both props supplied, omission during rollout, native feature fallback | A released behavior is lost, TimeInput gains a sheet, or conflicting props gain hidden precedence |
| FR12, API7     | Public API review                                          | variant, touch activation, named feature slots                                            | Surface selection leaks into a visual, activation, or feature-composition prop                    |

## Decision log

No proposed decision below is authoritative while this record remains draft.
The API direction reflects the owner decision recorded on the proposal;
exact-head approval is still required before promotion.

### Proposed DEC-1 — Use `adaptations` as the single surface-policy input

**Reference:** `spec:AST-014/DEC-1`
**Proposed decider:** `imdreamrunner`

Use `adaptations`, not `presentation`, as the forward API for component surface
policies. The name follows AST-012's environmental vocabulary and describes a
conditional rule set without creating a second picker- or device-specific axis.

Rejected if approved: preserving `presentation` and `nativePicker` as permanent
parallel owners, because they can issue conflicting instructions for one
rendered outcome.

### Proposed DEC-2 — Support omission, an explicit reset, and replacement policies

**Reference:** `spec:AST-014/DEC-2`
**Proposed decider:** `imdreamrunner`

Omission and `undefined` select the component's built-in recommended policy.
`"default"` explicitly restores it after a spread. A policy object replaces it
with one baseline surface and ordered conditional rules.

Rejected if approved: omission-only reset semantics, because explicit intent and
spread overrides become harder to recognize and review.

### Proposed DEC-3 — Use concise ordered surface rules over shared breakpoints

**Reference:** `spec:AST-014/DEC-3`
**Proposed decider:** `imdreamrunner`

Component rules use top-level `from`, `below`, and `pointer` conditions, AND
present conditions, and let the last matching rule win. Width names and boundary
semantics come from AST-012 and resolve through the nearest Theme.

Rejected if approved: positional tuples, raw media queries, inferred specificity,
and AST-012's nested theme-value rule wrapper for this single-value component
surface policy.

### Proposed DEC-4 — Keep surface vocabularies component-qualified

**Reference:** `spec:AST-014/DEC-4`
**Proposed decider:** `imdreamrunner`

Components share the policy grammar while exporting only the surfaces they can
render. DateInput and DateTimeInput distinguish `popover`, `bottom-sheet`, and
`native`; TimeInput distinguishes `typed` and `native`, preserving its typed
field for `nativePicker="never"` on every pointer.

Rejected if approved: forcing one global surface union, because it would make
unsupported values appear valid and would falsely give TimeInput an Astryx touch
sheet.

### Proposed DEC-5 — Preserve legacy behavior through a conflict-free migration

**Reference:** `spec:AST-014/DEC-5`
**Proposed decider:** `imdreamrunner`

Released `presentation` and `nativePicker` values map to complete adaptation
policies. During compatibility, old and new inputs are mutually exclusive or
diagnosed; neither silently overrides the other.

Rejected if approved: a lossy rename or undocumented precedence, because either
can change shipped behavior while appearing source-compatible.

## Open questions

- **OQ1 — What release window should govern deprecation and eventual removal of
  the released `presentation` and `nativePicker` props?** (`human-api`)
- **OQ2 — For components whose current omitted `presentation` means Popover,
  should omission switch to the built-in recommended policy in the first
  `adaptations` release or through a staged compatibility default?** (`human-api`)
- **OQ3 — Should the shared generic policy and resolver remain internal, or is
  there demonstrated caller value in a public cross-component type?**
  (`human-api`)
