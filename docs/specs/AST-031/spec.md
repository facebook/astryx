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
  [architecture:public-component-api, architecture:theme-application]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: [Selector, DateInput, DateTimeInput]
---

# Theme-aware component adaptations

## Intent

Components sometimes choose between semantically different interaction surfaces:
an anchored Selector popover or modal bottom sheet, and an Astryx or browser-native
date/time picker. Those choices should use the named width points introduced by
`spec:AST-012`, rather than component-local pixel queries, while remaining explicit
caller-owned policy.

The proposed public shape is one component-specific policy value with a required
server fallback and ordered environmental rules:

```tsx
<Selector
  adaptations={{
    default: 'popover',
    rules: [
      {
        when: {width: {below: 'md'}, pointer: 'coarse'},
        value: 'bottom-sheet',
      },
    ],
  }}
/>

<DateInput
  adaptations={{
    // Use an anchored Astryx picker by default and the OS picker only on
    // compact coarse-pointer devices.
    default: 'popover',
    rules: [
      {
        when: {width: {below: 'md'}, pointer: 'coarse'},
        value: 'native',
      },
    ],
  }}
/>
```

`adaptations.default` is the server-rendered value, hydration value, and no-match
fallback. The last matching rule wins.

## Public-API admission

The caller already owns whether Selector uses a modal or anchored interaction and
whether the date and date-time fields use native controls, a pointer popover, or a
bottom sheet. The existing `presentation` and `nativePicker` props prove that
ownership; this proposal does not move an internal decision to the caller.

Two otherwise identical DateInput usages can require width-sensitive outcomes the
released `nativePicker` prop cannot express: both use native controls on compact
coarse-pointer phones, but a scheduling field with visible custom constraints must
switch to Astryx's bottom sheet on a wider tablet while a simple birthday field may
remain native at every coarse-pointer width. The product also knows whether the
server must initially render the native or Astryx field; the component has no
viewport or primary-pointer information during SSR. Two Selector usages can
likewise require a modal sheet for a dense mobile workflow or an anchored popover
inside a desktop-like canvas at the same viewport width. The product knows those
workflow, breakpoint, and server-rendering requirements; the component cannot
derive them from content, layout, platform state, or Theme.

The missing caller-owned information is the mapping from reviewed environmental
conditions to the already-public policy values. `adaptations` admits that one
mapping without exposing raw queries or a general conditional-props bag.

## Non-goals

- Consuming `defineTheme().adaptations.rules` from component behavior. Component
  adaptations share AST-012's condition spelling and effective width points only;
  theme token/style rule values never affect the component result.
- Making arbitrary component props environmentally conditional. Each component
  admits one closed policy domain after public-API review.
- Migrating TimeInput or DateRangeInput. Neither has both Astryx popover and
  bottom-sheet surfaces, so the required `native | popover | bottom-sheet` value
  domain would advertise behavior it cannot render. Their current behavior remains
  unchanged.
- Migrating MultiSelector, DropdownMenu, or ContextMenu in this proposal.
  MoreMenu continues to pass its policy through to DropdownMenu. Their released
  behavior remains unchanged until separately reviewed; changing Selector does not
  silently change them through the shared legacy hook. ComplexSelector's separate
  presentation work remains owned by [#5826](https://github.com/facebook/astryx/pull/5826).
- Migrating AppShell's `mobileNav.breakpoint`. Its single binary threshold is the
  smaller API already accepted by AST-012 FR8; it does not need an ordered scalar
  rule language.
- Accepting raw media queries, custom breakpoint names, height/container queries,
  contrast, motion, hover, or arbitrary future condition axes in the first version.
- Selecting structural presentation with CSS custom properties. CSS cannot change
  mounted element type, dialog/listbox semantics, focus ownership, native input
  behavior, or lazy-loaded surface identity.
- Rendering every possible surface and hiding all but one with CSS. Duplicate form
  controls, ids, dialogs, effects, and focus targets are not a valid first-paint
  strategy.
- Replacing CSS-first theme adaptations for visual values. Size, density, spacing,
  and other styling remain owned by AST-012.

## Requirements

- **FR1 — One shared value shape.** Public
  `ComponentAdaptations<T extends string>` contains required `default: T` and a
  required `rules: readonly ComponentAdaptationRule<T>[]`, which may be empty for a
  constant resolved value. Public `ComponentAdaptationRule<T>` contains `when` and
  `value`. The shared types are exported from `@astryxdesign/core`; each component
  owns and exports its admitted string-literal value union.
- **FR2 — Conditions reuse a closed subset of AST-012.** Public
  `ComponentAdaptationCondition` is
  `Pick<ThemeAdaptationCondition, 'width' | 'pointer'>`, so the two grammars cannot
  drift. Width uses `sm | md | lg | xl | 2xl`; `from` is inclusive, `below` is
  exclusive, and fields are ANDed. Because both fields are optional in the shared
  type, an empty `when` is rejected by the runtime validator. Raw query strings are
  not accepted.
- **FR3 — Default is server truth.** `default` MUST be returned during SSR, as the
  hydration snapshot, and whenever no rule matches. After hydration, the resolver
  MUST publish the browser's current last-matching rule. The server snapshot is the
  no-match sentinel, so `matchMedia` is not read during server rendering or the
  hydration render.
- **FR4 — Rule order is precedence.** The resolver checks every rule in author
  order and returns the value from the last matching rule. Condition shape creates
  no specificity score. Reordering overlapping rules is an intentional behavior
  change.
- **FR5 — Width points come from the nearest Theme.** Conditions resolve against
  the nearest active Theme's effective AST-012 width map. Without provider context
  they follow the registered root-theme fallback; without an active theme they use
  AST-012 defaults. Nested themes may therefore select different values at the same
  viewport width. Components read this through a package-internal accessor, not by
  depending directly on the `DefinedTheme.__adaptations` storage field.
- **FR6 — Adaptation and direct policy are exclusive.** A component's
  `adaptations` prop cannot be combined with the defined direct prop that owns the
  same choice (`presentation` or `nativePicker`). DateInput and DateTimeInput
  deprecate `nativePicker` in favor of `adaptations` while preserving every legacy
  call at runtime; Selector's `presentation` remains supported. Selector's existing
  union can encode `?: never` exclusivity. DateInput and DateTimeInput keep their
  exported `interface` props extendable, so they add both optional members without
  converting the interface to a union; a runtime error rejects calls where both
  values are defined. An explicitly spread `undefined` does not conflict. This
  preserves interface-extension compatibility while keeping one effective policy.
- **FR7 — Selector's shorthand migrates deliberately.** Public
  `SelectorAdaptationValue` is an alias of the existing internal
  `ResolvedAdaptivePresentation` (`popover | bottom-sheet`) and is exported from
  both `@astryxdesign/core` and `@astryxdesign/core/Selector`. Public
  `SelectorPresentation` remains `SelectorAdaptationValue | adaptive` for
  compatibility. Selector's released `presentation="adaptive"` becomes equivalent
  to `default: 'popover'` plus a `{width: {below: 'md'}, pointer: 'coarse'}`
  bottom-sheet rule using the active Theme's `md`. This changes the exact default
  boundary: today's `max-width: 768px` includes equality, while AST-012 `below:
'md'` excludes it. At the default 768px point, a coarse-pointer Selector changes
  from bottom sheet to popover. There is no exact per-callsite migration because
  the shared grammar intentionally has no inclusive upper edge; products that need
  a different global cutoff adjust their Theme's `md`—which also moves AppShell
  when it uses its default `md` mobile-nav breakpoint—while a constant sheet uses
  `presentation="bottom-sheet"`. This is a reviewed breaking behavior change and
  requires a Changeset.
- **FR8 — Date and date-time adaptations select an exact surface.** Public
  `DateInputAdaptationValue` and `DateTimeInputAdaptationValue` are each
  `native | popover | bottom-sheet`, exported from `@astryxdesign/core` and their
  `@astryxdesign/core/DateInput` or `@astryxdesign/core/DateTimeInput` subpath.
  `native` renders browser/OS date/time controls, `popover` renders Astryx's pointer
  field and anchored surface, and `bottom-sheet` renders Astryx's touch field and
  modal sheet. These values have the same whole-tree meaning regardless of pointer
  precision. `nativePicker` is deprecated in favor of this exact policy, but its
  released runtime behavior remains supported. Migrate the shorthand as follows
  when the field's other props are compatible with every selected exact surface:

  | Component                 | Shorthand | Equivalent requested surface policy                           |
  | ------------------------- | --------- | ------------------------------------------------------------- |
  | DateInput / DateTimeInput | `touch`   | default `popover`; primary `pointer: coarse` → `native`       |
  | DateInput / DateTimeInput | `always`  | constant `native`                                             |
  | DateInput / DateTimeInput | `never`   | default `popover`; primary `pointer: coarse` → `bottom-sheet` |

  These mappings select the same initial and idle surface. They are intentionally
  not interaction-equivalent: `adaptations` holds the active tree through focus or
  an open picker under FR10, while legacy `touch` and `never` continue switching
  immediately when the primary pointer changes.

  For DateInput with a non-default `numberOfMonths` or explicit `weekStartsOn`,
  legacy `touch`/`always` renders today but has no exact `native` adaptation
  equivalent because those presentation options are not expressible by the OS
  control. For DateTimeInput, `hasSeconds`, non-default `timeIncrement`, or
  `timeOptionInterval` can make legacy `touch`/`always` render a mixed native-date
  plus Astryx-time tree, which likewise has no exact `adaptations` equivalent.
  Those legacy behaviors remain when `adaptations` is absent. Their deprecation
  is advisory only: it emits editor guidance and changes no runtime behavior.

- **FR9 — Exact surfaces validate capabilities eagerly.** If `default` or any rule
  names `native`, DateInput rejects a non-default `numberOfMonths` or explicit
  `weekStartsOn`; DateTimeInput rejects those plus `hasSeconds`, non-default
  `timeIncrement`, or `timeOptionInterval`. `dateConstraints`, `min`, and `max`
  remain valid because native fields enforce them on commit. Validation inspects
  the authored policy during render before evaluating browser matches, so a
  configuration cannot pass on one viewport and fail on another. Production and
  development both throw one path-specific error before mounting a surface.
  Existing direct `nativePicker` fallback behavior remains unchanged when
  `adaptations` is absent.
- **FR10 — Active interactions do not switch trees.** Selector snapshots the value
  in `show()` and releases it only after close and final-focus restoration.
  DateInput and DateTimeInput snapshot the resolved exact surface on focus or
  activation of the closed field and hold it through any owned Astryx surface.
  They release after owned-surface close and focus leaves the field, or after the
  native input loses focus. Environment or Theme changes affect the next
  interaction. Controlled committed values survive every release; an uncommitted
  text draft MUST NOT be discarded by a deferred switch.
- **FR11 — BottomSheet remains presentation-only.** BottomSheet does not read
  breakpoints or choose when it is used. The owning field or Selector resolves one
  exact adaptation value and mounts BottomSheet only for `bottom-sheet`.
- **FR12 — Component adaptations are independent of theme adaptation rules.** The
  component prop and `defineTheme({adaptations})` intentionally share a noun,
  condition names, width points, and authored-order precedence. They do not share
  values or execution: theme rules remain CSS-first per-leaf writes, while a
  component prop resolves one whole policy value in JavaScript.

- **IR1 — One internal compiler owns condition semantics.** Theme CSS generation
  and component adaptation resolution call a package-internal
  condition-to-media-query compiler with a caller-supplied diagnostic path. The
  helper is not re-exported from Core. This requirement applies only to
  component-adaptation values; unrelated hover, reduced-motion, CSS, and legacy
  component policies stay in their existing owners.
- **IR2 — One external-store subscription resolves a value.** The shared React
  resolver uses `useSyncExternalStore`, subscribes to every distinct compiled
  `MediaQueryList`, returns a stable matching-rule index, and cleans up all
  listeners. Subscription identity and memoization are keyed by the compiled query
  strings and effective breakpoint values, not by the caller's object/array
  identity, so documented inline object literals do not resubscribe on every render.
  A module-level registry shares identical query objects and tears them down after
  the last subscriber leaves.
- **IR3 — Runtime validation is path-specific.** Invalid condition keys, empty
  conditions, unknown breakpoint names, reversed ranges, non-finite points, and
  unsupported component values fail with a component/prop/rule path before opening
  a surface.
- **IR4 — No CSS or provider expansion is required.** Existing Theme context and
  root-theme registration already carry effective breakpoint metadata. AppShell
  migrates from its direct `__adaptations` read to the same package-internal
  effective-breakpoint accessor in the infrastructure change. The implementation
  MUST NOT emit breakpoint CSS merely because component adaptations exist,
  preserving AST-012 FR1, and MUST NOT add a parallel breakpoint context.
- **IR5 — Selector migration splits policy resolution from surface control.**
  `useSelectorPresentation` accepts only the already-resolved `popover |
bottom-sheet` value. Selector resolves its new policy before calling that shared
  controller. MultiSelector's call site changes to run the unchanged legacy
  adaptive hook itself and pass the resolved value into the controller, so
  Selector's migration cannot change MultiSelector behavior.

### Platform support

- Browser support follows Astryx's Tier 1 and Tier 2 support floor (representative
  Tier 2 versions: Chrome/Edge 114+, Safari 17+, Firefox 125+). Compiled width
  conditions use Media Queries Level 4 range syntax, matching AST-012 output. On a
  Tier 3 browser that does not parse a compiled query, that rule does not match and
  `default` remains active.
- SSR without viewport client hints renders `default` by contract.
- Real-browser evidence is required for width boundaries, primary-pointer
  selection, nested Theme overrides, focus continuity, and native input surfaces.
  It also covers the newly reachable cross combinations: coarse-pointer popovers
  retain touch-target floors, and fine-pointer bottom sheets remain fully keyboard
  operable with correct focus entry, dismissal, and restoration.

## Current-state impact

Current Core has competing private policies: Selector, MultiSelector, DropdownMenu,
and ContextMenu share `COMPACT_TOUCH_PRESENTATION_QUERY` (`max-width: 768px` plus
`pointer: coarse`), while DateInput, TimeInput, and DateTimeInput each copy
`(pointer: coarse)`. AppShell is the only component that currently resolves AST-012
width points through Theme metadata.

The first component migration changes Selector only. It updates
`component:Selector` FR4 and its presentation concept from a fixed private query to
the new caller-owned policy. MultiSelector and menus keep their current query, so
Selector and MultiSelector deliberately disagree at exactly the default 768px
boundary until MultiSelector is separately migrated.
`architecture:public-component-api` INV14 and `architecture:theme-application`
must link `spec:AST-031` once accepted. DateInput and DateTimeInput have no
component records today, so `family:input-fields` remains the current owner until
their implementation PR backfills or updates component contracts.

The shared infrastructure also moves AppShell's direct `__adaptations` breakpoint
read behind the package-internal accessor without changing AppShell behavior.

Selector's exact default 768px boundary is breaking as described by FR7 and must be
released as such. No per-callsite configuration can preserve the single equality
case; changing the Theme's `md` moves the shared global point and is the only
threshold migration. Existing nativePicker behavior does not change when the new
prop is absent; the shorthand is deprecated so editors direct new and migrating
callsites to the exact `adaptations` policy.

This proposal adds no CSS-variable or context layer. Structural presentation is a
JavaScript decision because it changes DOM identity, ARIA, focus ownership, and
native browser controls. The required `default` explicitly selects the complete
server and hydration tree for Selector, DateInput, and DateTimeInput.

Implementation is staged: shared compiler/resolver first with no component
behavior change, then one component/family per stacked pull request. Current
component contracts and consumer APIs remain authoritative until each component
change is separately accepted and implemented.

## Verification

| Contract  | Verification                                                                     | Representative states                                                                                     | Failure signal                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4   | public type tests, resolver unit tests, SSR/hydration tests                      | empty/one/overlapping/reordered rules; no match; server default                                           | hydration reads matchMedia, client never leaves default, or condition shape beats source order                                                                                     |
| FR5       | Theme integration and nested-provider tests                                      | defaults; root theme; nearest nested theme; changed `md`; equality                                        | a migrated component hardcodes 768px, reads `__adaptations` directly, ignores nearest Theme, or treats `below` as inclusive                                                        |
| FR6–FR9   | component public-type, compatibility, and behavior tests                         | direct prop; adaptations; forbidden combination; every shorthand row; invalid native policy in any rule   | two policies compete, a shorthand mapping changes, or invalid native policy passes on one viewport and fails only when its rule matches                                            |
| FR10–FR12 | interaction, focus, and ownership tests                                          | resize/theme change while open/focused; close/reopen; focus return                                        | an active surface swaps trees, loses focus/draft state, BottomSheet chooses policy, or theme rule values affect component structure                                                |
| IR1–IR5   | compiler parity, subscription cleanup, controller isolation, bundle/output tests | every width/pointer combination; malformed input; repeated inline rules; Selector/MultiSelector isolation | component and theme queries diverge, a helper leaks publicly, listeners churn/leak, Selector changes MultiSelector, breakpoint-only CSS appears, or a parallel context is required |

## Decision log

### DEC-1 — Use one component-specific `adaptations` value

**Reference:** `spec:AST-031/DEC-1`
**Decider:** pending

A component may expose `adaptations={{default, rules}}` for one admitted policy
concept. It is not a bag of partial props. Direct policy and adaptations remain
mutually exclusive.

### DEC-2 — Make `default` the explicit server and hydration value

**Reference:** `spec:AST-031/DEC-2`
**Decider:** pending

Servers do not know viewport or primary-pointer state. The caller supplies the tree
that must render during SSR and hydration; the client publishes the actual match
after hydration. `default` itself is the server hint, so this API does not add a
second `defaultIs…` prop like AppShell's older contract.

### DEC-3 — Reuse width and primary pointer only

**Reference:** `spec:AST-031/DEC-3`
**Decider:** pending

The initial grammar reuses AST-012 width and primary-pointer conditions. Additional
axes require separate semantic review rather than becoming structural switches by
accident.

### DEC-4 — Resolve structural values in JavaScript

**Reference:** `spec:AST-031/DEC-4`
**Decider:** pending

CSS remains the path for visual values. Adapted policy values can change mounted
controls, semantics, focus, and native behavior, so neither custom-property reads
nor duplicate hidden trees provide a correct first-paint implementation.

### DEC-5 — Deprecate date-field shorthand without changing behavior

**Reference:** `spec:AST-031/DEC-5`
**Decider:** `cixzhang`, `2026-09-11`

DateInput and DateTimeInput deprecate `nativePicker` in favor of `adaptations`.
The shorthand remains accepted and keeps its released runtime meaning so existing
calls do not break. Consumer docs and editor annotations provide the initial/idle
mapping for `touch`, `always`, and `never`, call out adaptations' intentional
active-interaction latching difference, and identify legacy mixed-surface cases
that have no exact adaptation. Removal is a separate future compatibility decision
and requires the release process's migration evidence and codemod.

Selector `presentation` remains supported compatibility syntax; this decision does
not deprecate it.

### DEC-6 — Adopt AST-012's exclusive `below` edge for Selector

**Reference:** `spec:AST-031/DEC-6`
**Decider:** pending

Selector's legacy adaptive query includes exactly 768px; the shared named-point
grammar does not. The migration accepts that one boundary change and has no exact
per-callsite equivalent. Adjusting Theme `md` is global and also moves AppShell when
it uses `md`; constant bottom-sheet policy remains available.

### DEC-7 — Preserve extendable date-field prop interfaces

**Reference:** `spec:AST-031/DEC-7`
**Decider:** pending

DateInput and DateTimeInput keep exported interface-shaped props so downstream
interfaces may continue extending them. Runtime validation, rather than converting
the interfaces to an exclusive union, rejects simultaneous defined `nativePicker`
and `adaptations` values.

## Open questions

- **OQ1 — Should later component value domains admit non-string primitives?**
  (`human-api`) The first consumers use closed string unions only.
