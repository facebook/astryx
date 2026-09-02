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

Give responsive component APIs one predictable naming model without treating
every mobile-sensitive choice as the same concept.

`variant` describes a visual treatment of the same component contract.
`presentation` describes the structural surface in which component-owned content
is presented. Platform ownership, touch activation, and named mobile-navigation
composition remain separate axes with names that describe those decisions.

This spec records the proposed shared vocabulary before more adaptive component
APIs ship. It preserves the current `presentation` direction used by Selector,
MultiSelector, DropdownMenu, MoreMenu, ContextMenu, and the pending
ComplexSelector work instead of renaming that structural choice to `variant` or
adding component-specific mobile booleans.

## Recommendation

Use this plain-language rule when naming responsive component props:

- Use `variant` when the same component and interaction model only look
  different.
- Use `presentation` when the component-owned content can open in a different
  structural surface.
- For popover/sheet components, support `popover` and `bottom-sheet` as forced
  choices and `adaptive` as the responsive choice.
- Keep `nativePicker` separate because it decides whether Astryx or the
  browser/OS owns the picker.
- Keep `touchTrigger` separate because it changes how an overlay opens, not what
  surface renders.
- Avoid generic `mobile`, `isMobile`, or `mobileMode` props. Name the actual
  capability, policy, or concrete feature instead.

For example:

```tsx
<Selector variant="ghost" presentation="adaptive" />
```

`variant="ghost"` changes the trigger's appearance. `presentation="adaptive"`
uses a Popover normally and a BottomSheet when the shared compact-touch policy
matches.

## Non-goals

- Making every responsive behavior caller-configurable. Components should still
  derive touch target sizing, viewport fit, wrapping, and other safe defaults.
- Making BottomSheet the automatic presentation for every narrow viewport.
- Treating viewport width as device identity or using `mobile` as a generic
  synonym for compact layout.
- Renaming the `MobileNav` component or AppShell's `mobileNav` feature slot.
- Renaming Tooltip or HoverCard's `touchTrigger`; it controls activation rather
  than surface selection.
- Combining browser/OS picker ownership with popover-versus-sheet presentation
  in one overloaded enum.
- Adding a Dialog prop that swaps Dialog for BottomSheet. A composition that owns
  both primitives must own that decision.
- Implementing API or runtime changes in this specification-only change.

## Requirements

- **FR1 — Public names describe one caller-owned axis.** A responsive public prop
  MUST describe the decision the caller controls, not the device condition used
  internally to resolve it. A prop MUST NOT combine visual styling, structural
  presentation, platform ownership, and activation behavior into one vocabulary.
- **FR2 — `variant` names visual treatment.** `variant` SHOULD select styling or
  layout treatments while preserving the component's owning primitive and core
  interaction contract. A variant may change density, emphasis, chrome, or
  internal arrangement. It MUST NOT silently replace an anchored interaction
  with a modal one.
- **FR3 — `presentation` selects a rendering policy.** A component that can
  present the same owned content in an anchored Popover or modal BottomSheet
  SHOULD expose `presentation`. Explicit values select the rendered surface in
  every environment; `adaptive` delegates surface selection to the shared
  responsive policy. The resolved choice may change containment, positioning,
  focus entry and return, dismissal, and popup semantics while preserving the
  component's task and value model.
- **FR4 — Popover/sheet vocabulary is shared and closed.** Eligible components
  SHOULD use the closed values `popover`, `bottom-sheet`, and `adaptive` rather
  than component-specific aliases. Public component types remain
  component-qualified even when their implementation reuses a shared internal
  type.
- **FR5 — `adaptive` has one shared overlay meaning.** In the popover/sheet
  vocabulary, `adaptive` MUST resolve to BottomSheet only on a compact viewport
  whose primary pointer is coarse, and to Popover otherwise. The exact query is
  owned centrally. The resolved presentation MUST remain stable for the lifetime
  of an open interaction so a resize or input-capability change does not replace
  the active surface underneath the user.
- **FR6 — Explicit values override adaptive policy.** `popover` and
  `bottom-sheet` MUST force the named surface independent of viewport or pointer
  capability, subject only to documented platform fallback. Presentation-
  specific props such as placement or alignment MUST be documented as ignored or
  rejected when their surface is inactive.
- **FR7 — Platform-owned pickers keep a distinct contract.** `nativePicker`
  controls whether browser/OS picker UI replaces Astryx-owned picker UI. It MUST
  remain distinct from `presentation`, because `native` is an implementation
  owner while `popover` and `bottom-sheet` are Astryx-owned surfaces.
- **FR8 — Touch activation keeps a distinct contract.** `touchTrigger` controls
  how Tooltip and HoverCard open where hover is unavailable. It MUST NOT be
  renamed to `presentation` because the rendered surface does not change.
- **FR9 — Generic responsive APIs avoid device nouns.** New cross-component
  props MUST NOT use names such as `mobile`, `isMobile`, or `mobileMode` when the
  behavior is actually based on viewport, pointer precision, hover capability,
  or available space. A prop may retain a mobile noun when it names a concrete
  feature or component, such as AppShell's `mobileNav` slot.
- **FR10 — Existing exceptions do not become precedent.** Existing uses of
  `variant` for attached/detached or fullscreen layout remain compatible unless
  separately migrated. New APIs MUST apply FR2 and FR3 rather than copying an
  older name solely for consistency with that exception.

### Public API requirements

- **API1 — Overlay surface selector.** The canonical prop shape is:

  ```ts
  presentation?: 'popover' | 'bottom-sheet' | 'adaptive';
  ```

  `popover` remains the compatibility default unless an owning component spec
  explicitly approves a different default. `popover` and `bottom-sheet` are
  unconditional rendering choices. `adaptive` is the only value whose result
  changes in response to viewport and pointer conditions.

- **API2 — Component-qualified public types.** Components MAY implement API1
  through one internal closed type, but SHOULD export names such as
  `SelectorPresentation` and `DropdownMenuPresentation` from their own subpaths.
  Consumers MUST NOT need to import an unrelated component's type.
- **API3 — Native picker policy.** DateInput, DateTimeInput, and TimeInput retain
  the `nativePicker` prop name. The target vocabulary is
  `auto | always | never`: `auto` lets the component apply its documented
  platform policy, `always` requests browser/OS ownership wherever supported,
  and `never` keeps Astryx ownership. The released `touch` value MUST remain an
  accepted deprecated alias until a separately approved compatibility window
  allows removal.
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

Current responsive APIs fall into four distinct groups:

1. Selector, MultiSelector, DropdownMenu, MoreMenu, ContextMenu, and the pending
   ComplexSelector work use `presentation` for
   `popover | bottom-sheet | adaptive`.
2. DateInput, DateTimeInput, and TimeInput use `nativePicker` for
   `touch | always | never`.
3. Tooltip and HoverCard use `touchTrigger` for `auto | tap | none`.
4. AppShell uses `mobileNav` for a concrete navigation feature and
   `defaultIsMobile` as an SSR media-query seed.

The first group is already internally consistent and should remain the model for
components that switch between Astryx-owned overlay primitives. `variant` is a
separate axis on components such as Selector, where
`variant="ghost" presentation="adaptive"` is a coherent combination: one prop
chooses trigger appearance and the other chooses the option surface.

The current picker prop name is also semantically distinct and should remain.
Its `touch` value is the naming inconsistency: it names today's detection input,
while `always` and `never` name policy. API3 proposes `auto` as the durable policy
name and retains `touch` as a compatibility alias.

If accepted, the implementation pull request updates:

- [public component API architecture](../../architecture/public-component-api.md)
  and [API conventions](../../contributing/api-conventions.md) with the naming
  boundary;
- the affected component records so their local presentation and specialized
  behavior link to this system decision rather than restating the taxonomy;
- the shared adaptive-presentation type and tests only if implementation review
  finds a name that better describes the closed popover/sheet vocabulary; and
- picker source, types, docs, tests, examples, and Changesets for the `auto`
  alias and deprecation path.

Current component behavior, defaults, and compatibility remain authoritative
until those implementation and documentation changes ship.

## Verification

| Contract        | Verification                                                                  | Representative states                                                                | Mutation or failure expectation                                                                      |
| --------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| FR1–FR4, API1–2 | Public type and component-doc review                                          | Selector, MultiSelector, DropdownMenu, MoreMenu, ContextMenu, ComplexSelector        | A new component uses `variant`, `mobileMode`, or a component-specific synonym for popover/sheet      |
| FR5–FR6         | Shared adaptive-presentation unit tests and component interaction tests       | compact coarse pointer; compact fine pointer; wide coarse pointer; explicit surfaces | Adaptive chooses a different policy by component, changes while open, or overrides an explicit value |
| FR7, API3       | DateInput, DateTimeInput, and TimeInput native-picker tests and type fixtures | auto/touch alias; always; never; unsupported native behavior                         | Picker ownership is folded into presentation or the compatibility alias changes behavior             |
| FR8, API4       | Tooltip and HoverCard touch-trigger tests                                     | auto; tap; none; actionable and non-actionable triggers                              | Touch activation changes the surface vocabulary or loses current behavior                            |
| FR9, API5       | API review against the public prop surface                                    | capability-based adaptation; AppShell named feature slot; SSR seed                   | A generic device-named prop is added without naming a concrete feature                               |
| FR10            | Review of new or changed structural choices                                   | current variants; new popover/sheet APIs                                             | An existing exception is copied into a new API without an owning decision                            |

## Decision log

No decisions are authoritative while this record remains draft.

### Proposed DEC-1 — Keep `presentation` for structural surface selection

**Reference:** `spec:AST-014/DEC-1`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

Use `presentation` for the shared Popover/BottomSheet axis. Keep `variant` for
visual treatment and retain specialized names for platform ownership, touch
activation, and named feature slots.

Rejected if approved: renaming the overlay axis to `variant`, because that makes
trigger appearance and overlay structure compete for one prop name; renaming it
to `mobile`, because explicit BottomSheet use is not limited to device identity.

### Proposed DEC-2 — Normalize native-picker policy around `auto`

**Reference:** `spec:AST-014/DEC-2`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

Keep `nativePicker` as the ownership axis and make `auto` the durable name for
the default policy. Preserve `touch` as a deprecated compatibility alias until a
separately approved removal window.

Rejected if approved: adding `native` to the popover/sheet presentation enum,
because a browser-owned input is not another Astryx overlay surface.

### Proposed DEC-3 — One prop supports forced and responsive selection

**Reference:** `spec:AST-014/DEC-3`
**Proposed deciders:** `cixzhang`, `rubyycheung`, `imdreamrunner`

`presentation` selects a policy rather than acting only as a mobile override.
`popover` and `bottom-sheet` force the named rendering in every environment;
`adaptive` alone resolves through responsive conditions. This lets tests,
showcases, specialized products, and responsive products use the same axis
without a second `mobilePresentation` prop.

Rejected if approved: a separate mobile-only override such as
`mobilePresentation`, because it splits one surface decision across two props,
assumes device identity, and creates precedence questions when both props are
set. A responsive mapping object remains future work unless real caller-owned
cases require policies beyond the shared `adaptive` behavior.

## Open questions

- **OQ1 — Should the internal shared type remain `AdaptivePresentation`, or use
  a narrower name such as `PopoverSheetPresentation`?** (`human-api`)
- **OQ2 — What release window should govern deprecation and eventual removal of
  `nativePicker="touch"`?** (`human-api`)
- **OQ3 — Should the existing AppShell `defaultIsMobile` SSR hint be migrated to
  `defaultIsBelowBreakpoint`, or merely documented as a compatibility
  exception?** (`human-api`)
