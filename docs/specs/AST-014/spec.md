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

# Responsive presentation vocabulary system spec

## Intent

Give responsive component APIs one predictable naming model without creating
multiple public owners for one rendered outcome.

`variant` describes a visual treatment of the same component contract.
`presentation` describes which interaction surface or presentation policy the
component renders, whether that surface is owned by Astryx or by the browser/OS.
Activation behavior and named feature composition remain separate axes with
names that describe those decisions.

This spec records the proposed shared vocabulary before more adaptive component
APIs ship. It keeps the `presentation` direction used by Selector,
MultiSelector, DropdownMenu, MoreMenu, ContextMenu, and the pending
ComplexSelector work, and extends that owner to platform surfaces instead of
preserving a second picker-specific presentation prop.

## Recommendation

Use this plain-language rule when naming responsive component props:

- Use `variant` when the same component and interaction model only look
  different.
- Use one `presentation` prop when the component can render mutually exclusive
  interaction surfaces, including browser/OS-owned surfaces.
- Use concrete values such as `popover`, `bottom-sheet`, or `native` when the
  caller forces a surface.
- Use `adaptive` for the component's one documented recommended responsive
  policy. If callers demonstrably need another adaptive strategy, give that
  strategy a distinct value in the same `presentation` prop rather than adding a
  competing prop.
- Keep `touchTrigger` separate because it changes how an overlay opens, not what
  surface renders.
- Avoid generic `mobile`, `isMobile`, or `mobileMode` props. Name the actual
  capability, policy, or concrete feature instead.

For example:

```tsx
<Selector variant="ghost" presentation="adaptive" />
```

`variant="ghost"` changes the trigger's appearance. `presentation="adaptive"`
uses Selector's documented responsive surface policy.

## Non-goals

- Making every responsive behavior caller-configurable. Components should still
  derive touch target sizing, viewport fit, wrapping, and other safe defaults.
- Requiring every component to expose the same presentation values. Components
  share names only where they share the same caller-visible outcome.
- Giving `adaptive` one universal surface mapping across unrelated components.
  Each owning component documents one canonical policy over its supported
  surfaces.
- Making BottomSheet the automatic presentation for every narrow viewport.
- Treating viewport width as device identity or using `mobile` as a generic
  synonym for compact layout.
- Renaming the `MobileNav` component or AppShell's `mobileNav` feature slot.
- Renaming Tooltip or HoverCard's `touchTrigger`; it controls activation rather
  than surface selection.
- Shipping the DateInput, DateTimeInput, or TimeInput migration in this
  specification-only change.
- Adding a Dialog prop that swaps Dialog for another primitive. A composition
  that owns multiple primitives must first establish a caller-owned presentation
  contract.

## Requirements

- **FR1 — One rendered outcome has one public owner.** A component MUST NOT
  expose parallel props that can independently select mutually exclusive
  interaction surfaces. The owning prop describes the caller-controlled result,
  not merely the device condition or implementation branch used to resolve it.
- **FR2 — `variant` names visual treatment.** `variant` SHOULD select styling or
  layout treatments while preserving the component's owning primitive and core
  interaction contract. A variant may change density, emphasis, chrome, or
  internal arrangement. It MUST NOT silently replace an anchored interaction
  with a modal or platform-owned one.
- **FR3 — `presentation` selects the rendered surface policy.** A component that
  can present one task through mutually exclusive interaction surfaces SHOULD
  expose `presentation`. Its value may force a concrete surface or select one
  documented policy that resolves among surfaces. The selected presentation may
  change containment, positioning, focus entry and return, dismissal, popup
  semantics, and whether Astryx or the platform draws the picker while preserving
  the component's task and value model.
- **FR4 — Shared surface names keep shared meanings.** Components SHOULD use
  `popover`, `bottom-sheet`, and `native` when they expose those same observable
  surfaces. Public component types remain component-qualified, and a component
  omits values for surfaces it does not support.
- **FR5 — `adaptive` means one canonical component policy.** For each component,
  `adaptive` MUST resolve through one documented recommended policy over that
  component's supported surfaces. Different component families may resolve to
  different surfaces because their tasks and platform support differ. The
  resolved presentation MUST remain stable for the lifetime of an open
  interaction so a resize or capability change does not replace the active
  surface underneath the user.
- **FR6 — Additional adaptive strategies stay on the same axis.** When two
  otherwise identical caller situations genuinely require different responsive
  surface policies, the owning component MAY add a specifically named policy
  value to `presentation` after satisfying `spec:AST-002`. It MUST NOT encode the
  alternative through a sibling boolean, picker prop, or hidden precedence rule.
- **FR7 — Explicit surface values are predictable.** A concrete presentation
  value MUST request the named surface independent of viewport or pointer
  capability, subject only to a documented platform fallback. Presentation-
  specific props such as placement or alignment MUST be documented as ignored or
  rejected when their surface is inactive.
- **FR8 — Platform-owned pickers participate in presentation.** A browser/OS
  picker and an Astryx picker are mutually exclusive rendered outcomes, so their
  forward API MUST share the `presentation` owner. Existing `nativePicker` props
  are compatibility inputs, not precedent for a second permanent axis.
- **FR9 — Touch activation keeps a distinct contract.** `touchTrigger` controls
  how Tooltip and HoverCard open where hover is unavailable. It MUST NOT be
  renamed to `presentation` because the rendered surface does not change.
- **FR10 — Generic responsive APIs avoid device nouns.** New cross-component
  props MUST NOT use names such as `mobile`, `isMobile`, or `mobileMode` when the
  behavior is actually based on viewport, pointer precision, hover capability,
  or available space. A prop may retain a mobile noun when it names a concrete
  feature or component, such as AppShell's `mobileNav` slot.
- **FR11 — Existing exceptions do not become precedent.** Existing uses of
  `variant` for attached/detached or fullscreen layout remain compatible unless
  separately migrated. New APIs MUST apply FR2 and FR3 rather than copying an
  older name solely for consistency with that exception.

### Public API requirements

- **API1 — Component-qualified presentation types.** Components SHOULD export a
  local type such as `SelectorPresentation` or `DateInputPresentation`. They MAY
  reuse internal primitives, but consumers MUST NOT need to import an unrelated
  component's type. Components share literal values only when those values make
  the same observable promise.
- **API2 — Popover/sheet components.** A component whose supported surfaces are
  Popover and BottomSheet SHOULD use:

  ```ts
  presentation?: 'popover' | 'bottom-sheet' | 'adaptive';
  ```

  `popover` remains the compatibility default for already released components
  unless their owning component spec approves a different migration. Their
  `adaptive` policy selects BottomSheet only on a compact viewport whose primary
  pointer is coarse, and Popover otherwise. The exact query is owned centrally.

- **API3 — Native-picker migration.** DateInput, DateTimeInput, and TimeInput MUST
  converge on `presentation` rather than adding it beside `nativePicker` as an
  independent selector. Their released three-value `nativePicker` API remains
  accepted until a separately approved compatibility window allows removal:

  - `touch` represents the current recommended adaptive policy: platform-owned
    on a coarse primary pointer and Astryx-owned on a fine primary pointer.
  - `always` represents a forced native presentation wherever supported.
  - `never` represents an Astryx-owned adaptive policy: Popover on a fine primary
    pointer and the Astryx touch surface on a coarse primary pointer.

  A component-level migration MUST define `DateInputPresentation`,
  `DateTimeInputPresentation`, and `TimeInputPresentation` values that preserve
  all three released behaviors before introducing the new prop. It MUST give the
  `never` behavior an explicit policy value rather than hiding it behind a second
  owner. During compatibility, types SHOULD make `presentation` and
  `nativePicker` mutually exclusive; runtime handling MUST diagnose an invalid
  combination and MUST NOT rely on undocumented precedence.

- **API4 — Touch trigger policy.** Tooltip and HoverCard retain
  `touchTrigger?: 'auto' | 'tap' | 'none'`. These values describe whether touch
  activates the existing overlay, not which overlay primitive renders.
- **API5 — Named feature slots.** AppShell retains `mobileNav` because it
  configures or replaces the concrete MobileNav feature. Future SSR hints SHOULD
  name the seeded condition, such as `defaultIsBelowBreakpoint`, rather than
  claiming device identity. Renaming the released `defaultIsMobile` field is
  outside this spec's implementation scope.

### Platform support

- Supported feature/engine floor: every browser supported by Astryx Core with
  the existing media-query, Popover, BottomSheet, native-input, and fallback
  contracts of each owning component.
- Unsupported behavior: an adaptive decision MUST NOT depend on user-agent
  device labels. Components use capability and layout signals and preserve their
  documented fallback when a requested platform surface is unavailable.
- Browser evidence: presentation behavior requires real Chromium coverage at
  compact coarse-pointer and non-compact or fine-pointer states. Native picker
  behavior that differs by engine requires real Safari/iOS or Android evidence;
  Playwright WebKit is not a substitute for Safari.

## Current-state impact

Current responsive APIs fall into three semantic groups:

1. Selector, MultiSelector, DropdownMenu, MoreMenu, ContextMenu, and the pending
   ComplexSelector work use `presentation` for
   `popover | bottom-sheet | adaptive`.
2. DateInput, DateTimeInput, and TimeInput use the released `nativePicker` prop
   for three policies that also select among mutually exclusive presentation
   surfaces.
3. Tooltip and HoverCard use `touchTrigger` for `auto | tap | none`, while
   AppShell uses `mobileNav` for a concrete navigation feature and
   `defaultIsMobile` as an SSR media-query seed.

The first group establishes `presentation` as the forward owner for mutually
exclusive surfaces. `variant` remains a separate axis on components such as
Selector, where `variant="ghost" presentation="adaptive"` is coherent: one prop
chooses trigger appearance and the other chooses the option surface.

The date/time picker behavior belongs to the same presentation axis despite its
historical prop name. Keeping `nativePicker` while later adding `presentation`
would permit conflicts such as a forced BottomSheet beside an always-native
picker. API3 therefore treats `nativePicker` as a released compatibility input
that must migrate into one complete presentation contract. The exact name for
the existing Astryx-only adaptive (`never`) policy remains an owner decision; it
is not replaced by a lossy one-to-one rename in this system spec.

If accepted, implementation pull requests update:

- [public component API architecture](../../architecture/public-component-api.md)
  and [API conventions](../../contributing/api-conventions.md) with the naming
  boundary;
- the affected component records so their local values and adaptive policy link
  to this system decision rather than restating the taxonomy;
- the shared popover/sheet presentation type and tests only if implementation
  review finds a name that better describes that closed vocabulary; and
- picker source, types, docs, tests, examples, and Changesets only after the
  component-level presentation values and compatibility path are approved.

Current component behavior, defaults, and compatibility remain authoritative
until those implementation and documentation changes ship.

## Verification

| Contract        | Verification                                                              | Representative states                                                                 | Mutation or failure expectation                                                                         |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| FR1–FR4, API1–2 | Public type and component-doc review                                      | Selector, MultiSelector, DropdownMenu, MoreMenu, ContextMenu, ComplexSelector         | A component uses parallel props, `variant`, or a component-specific synonym for the same surface choice |
| FR5–FR7         | Presentation policy unit tests and component interaction tests            | each concrete surface; canonical adaptive policy; any named alternative policy        | Adaptive is undocumented or unstable, or a second policy is hidden behind a sibling prop                |
| FR8, API3       | DateInput, DateTimeInput, and TimeInput migration tests and type fixtures | each legacy mapping; each new value; both props supplied; unsupported native behavior | A released behavior is lost, two props independently own the result, or precedence is silent            |
| FR9, API4       | Tooltip and HoverCard touch-trigger tests                                 | auto; tap; none; actionable and non-actionable triggers                               | Touch activation changes the surface vocabulary or loses current behavior                               |
| FR10, API5      | API review against the public prop surface                                | capability-based adaptation; AppShell named feature slot; SSR seed                    | A generic device-named prop is added without naming a concrete feature                                  |
| FR11            | Review of new or changed structural choices                               | current variants; new presentation APIs                                               | An existing exception is copied into a new API without an owning decision                               |

## Decision log

No decisions are authoritative while this record remains draft.

### Proposed DEC-1 — `presentation` owns mutually exclusive rendered surfaces

**Reference:** `spec:AST-014/DEC-1`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

Use `presentation` for the full surface-selection axis, including Astryx-owned
Popover and BottomSheet surfaces and browser/OS-owned picker surfaces. Keep
`variant` for visual treatment and retain specialized names only for genuinely
independent activation behavior and named feature composition.

Rejected if approved: preserving `nativePicker` as a permanent parallel owner,
because a future component exposing both it and `presentation` could accept
conflicting instructions for one rendered outcome; renaming the axis to
`variant`, because trigger appearance and overlay structure may coexist.

### Proposed DEC-2 — `adaptive` is canonical per component, not universal

**Reference:** `spec:AST-014/DEC-2`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

`adaptive` selects one documented recommended policy for the owning component.
Popover/sheet selectors share the compact-coarse BottomSheet policy. A date or
time input may include a native surface in its canonical policy because that is
part of its supported task and platform contract.

If caller evidence establishes another legitimate adaptive strategy, it receives
a distinct policy value inside `presentation`. This keeps one owner without
pretending that Dialog, selection menus, and platform pickers must all resolve
through one universal surface map.

Rejected if approved: defining `adaptive` as a global alias for BottomSheet,
because unrelated components support different surface sets; adding sibling
props such as `nativePicker` or `mobilePresentation` for alternate strategies,
because they create overlapping ownership and precedence.

### Proposed DEC-3 — Migrate native-picker policies without losing behavior

**Reference:** `spec:AST-014/DEC-3`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

DateInput, DateTimeInput, and TimeInput move toward one `presentation` contract.
The existing `touch`, `always`, and `never` behaviors remain supported while a
component-level decision names the canonical adaptive, forced native, and
Astryx-only adaptive policies. The migration prevents or diagnoses simultaneous
use of the old and new props rather than creating hidden precedence.

Rejected if approved: renaming only `nativePicker="touch"` to `auto` while
leaving `nativePicker` as a permanent second owner; removing the `never` behavior
without compatibility and usage evidence.

### Proposed DEC-4 — One prop supports forced and responsive selection

**Reference:** `spec:AST-014/DEC-4`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

`presentation` selects a policy rather than acting only as a mobile override.
Concrete surface values force the named rendering where supported; `adaptive`
and any separately admitted named policy values resolve through documented
responsive conditions. Tests, showcases, specialized products, and responsive
products use the same axis without a second `mobilePresentation` prop.

Rejected if approved: a separate mobile-only override, because it splits one
surface decision across two props, assumes device identity, and creates
precedence questions when both props are set. A general responsive mapping
object remains future work unless caller evidence shows named policies cannot
express the required intent.

## Open questions

- **OQ1 — What should the DateInput, DateTimeInput, and TimeInput value be for
  the current `nativePicker="never"` behavior: an Astryx-owned adaptive policy
  that uses Popover on fine pointers and the Astryx touch surface on coarse
  pointers?** (`human-api`)
- **OQ2 — What release window should govern deprecation and eventual removal of
  the three `nativePicker` compatibility values?** (`human-api`)
- **OQ3 — Should the internal shared popover/sheet type remain
  `AdaptivePresentation`, or use a narrower name such as
  `PopoverSheetPresentation`?** (`human-api`)
- **OQ4 — Should the existing AppShell `defaultIsMobile` SSR hint be migrated to
  `defaultIsBelowBreakpoint`, or merely documented as a compatibility
  exception?** (`human-api`)
