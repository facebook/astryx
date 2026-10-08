---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:icon-resolution-and-component-slots
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/Icon/,
    packages/core/src/theme/defineTheme.ts,
    packages/core/src/Selector/,
    packages/cli/,
  ]
verified_by:
  [
    packages/core/src/Icon/globalIconRegistry.test.tsx,
    packages/core/src/theme/defineTheme.test.ts,
    packages/core/src/Selector/Selector.test.tsx,
    packages/cli/api/theme/build/build.test.mjs,
  ]
deciding_specs:
  [
    spec:AST-054/DEC-3,
    spec:AST-054/DEC-4,
    spec:AST-054/DEC-5,
    spec:AST-054/DEC-9,
    spec:AST-054/DEC-10,
  ]
---

# Icon resolution and component slots

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "component-slots": [
      "INV1",
      "INV2",
      "INV3",
      "INV6",
      "INV7",
      "INV8",
      "INV10",
      "INV11",
      "INV12"
    ]
  }
}
```

This record defines how shared icons and component-owned icon roles fit together.
It is the approved target architecture. Existing extension keys continue to work
until a separate compatibility decision changes them.

## Purpose

A theme author should be able to change an icon used for one component role
without changing every use of the same shared icon.

The system needs two separate choices:

1. which shared icon name a component role uses; and
2. which artwork the active theme uses for that shared icon name.

Keeping those choices separate avoids turning every component detail into a new
global icon name.

## Current baseline

Current `main` has a shared `IconName` registry and also supports namespaced
extension keys. Some component-owned artwork uses those extension keys directly.
This record does not invalidate or require migration of that shipped behavior.

The target model adds one rule for future component roles: new semantic component
slots use `componentIcons`. Shipped extension keys remain supported until a
separate compatibility decision changes them. This record does not decide the
outcome for any existing component.

## System model

### Shared icon resolution

`IconName` is the closed set of shared semantic icon names, such as `check`,
`close`, and `chevronDown`. Existing extension keys coexist with that set.

The general resolver chooses one registry source in this order:

1. the active theme's `icons[name]` entry;
2. a process-wide `registerIcons()` entry; and
3. a matching entry in `defaultIcons`.

Each source entry may be fixed or adaptive under the grouped capability contract. A
selected entry is atomic: missing branches never merge from another source. An exact
size branch is optional; when absent, the root branch renders in the resolved box.
Authored registry entries are validated before theme use. If malformed untyped,
hand-assembled, or incompatible built data reaches runtime, an active-theme entry
warns once in development, remains inspectable, and is skipped so process-wide then
built-in precedence continues. A malformed process-wide entry follows the same
reporting and skips to the built-in default. Production emits no
capability-mismatch console warnings.

This record does not change which shared or extension keys the general resolver
accepts. Theme application owns how the active theme is selected. Theme authoring
owns how fixed/adaptive `icons` entries are normalized and inherited. The Icon
component contract owns its public source modes, rendering, independent presentation
requests, size, color, and accessibility.

### Typed component-owned slots

A component icon slot names a stable purpose inside one component. It does not
name artwork. A metadata-bearing slot may additionally declare the finite state
labels that its owner can report; the component still owns when those states change.

The public `@astryxdesign/core/Icon` subpath owns one augmentable map. Its released
`true` value stays valid and stateless. Metadata-bearing values opt a role into theme
role-size and one-effective-state appearance:

```ts
// Conceptual public shape; role names and state literals come from their owners.
export interface ComponentIconSlotMap {
  'selector-selected-option': true;
  'example-component-role': {
    states: 'examplePrimary' | 'exampleFallback';
  };
}

type StatesOf<T> = T extends {states: infer State extends string}
  ? State
  : never;

export type ComponentIconSlotName = keyof ComponentIconSlotMap & string;
export type ComponentIconStateName = StatesOf<
  ComponentIconSlotMap[keyof ComponentIconSlotMap]
>;

export type ComponentIconMap = Partial<
  Record<ComponentIconSlotName, IconName | null>
>;
```

The interface must be declared in the public module that consumers augment. An
interface declared only in an implementation file and re-exported from the public
subpath will not widen the type used by consumers. Runtime resolver code imports the
map from its public owner. Existing slot augmentations whose value is `true` continue
to type-check, contribute no `ComponentIconStateName`, and keep only their source
mapping behavior.

External component packages add their slots by augmenting the same public
`@astryxdesign/core/Icon` module. A slot uses
`<component-kebab>-<semantic-role>`. The role describes why the icon exists, not
its current shape or direction. Every metadata-bearing role also provides generated
owner metadata containing its component/family default size and a deterministic
precedence over only its declared states. It reports zero or one effective state.
Exact helper and field spellings may vary without changing this map contract.

`defineTheme({componentIcons})` maps every component slot to a shared `IconName` or
to `null`. It is separate from `defineTheme({icons})` and from role presentation
metadata:

```ts
defineTheme({
  name: 'brand',
  componentIcons: {
    'selector-selected-option': 'success',
  },
  icons: {
    success: <BrandSuccessIcon />,
  },
});
```

The slot map says which shared meaning a component role uses. The icon map says
which artwork draws that shared meaning. Metadata never changes the
`IconName | null` source contract.

### Component slot precedence

A component resolves an icon-bearing role's source in this order:

1. a consumer-provided instance prop, when the component exposes one;
2. the nearest active theme's `componentIcons[slot]` entry; and
3. the component's declared fallback `IconName | null`.

`undefined` means “use the next fallback.” `null` means “render no icon.” A mapped
`IconName` continues through shared icon resolution. Existing `selectedIcon` and
`pressedIcon` props remain explicit consumer source overrides; without one, the
normal role source remains selected.

For a metadata-bearing role, the owning component evaluates active conditions in
its declared precedence and sends zero or one effective `ComponentIconStateName`
to Icon capability resolution. There is no multi-state appearance merge. A `true`
role sends no state and receives no role-size override or state appearance. Source
resolution never becomes a state-transition resolver.

Shared resolver modules apply source order consistently:

- `getComponentIconName(slot, fallback, source)` resolves the slot to a shared
  `IconName | null`;
- `getComponentIcon(slot, fallback, source)` resolves that shared name to
  artwork; and
- the client hook resolves the same slot and fallback from the active theme.

Components use these resolvers instead of reading `componentIcons` directly. The
resolver does not own a component's slot name, fallback, state transition, or
rendering rules. Request-aware resolution then applies the shared Icon capability
sequence from `spec:AST-054/DEC-5` without changing source precedence.

This record defines the meaning of an active theme's `componentIcons` map and role
metadata. Theme authoring owns capability and role-size normalization and
inheritance. Theme compilation owns preserving the normalized maps and generated
metadata in built output. Theme application owns active-theme selection.

## Known deviations

- **NumberInput stepper icon.** Current `NumberInput` resolves its stepper through
  a general extension key instead of `componentIcons`. This shipped behavior
  remains supported and is not precedent for new component slots.
- **Owner:** `component:NumberInput` once that component contract exists.
- **Exit condition:** a separately reviewed migration uses the component-slot
  model while preserving released callers and theme overrides, or follows an
  explicitly approved breaking-change path.

This record does not choose the migration design or timeline.

## Boundaries and invariants

- **INV1 — Shared names and component roles are separate.** `IconName` owns
  shared semantic meanings. `ComponentIconSlotName` owns component-specific
  purposes.
- **INV2 — Slots are typed and owner-declared.** Every Core slot is listed in
  `ComponentIconSlotMap`. External packages extend that map instead of adding
  unowned Core strings. A value of `true` stays stateless and nonparticipating;
  metadata-bearing values own finite literal state vocabularies.
- **INV3 — Slots map to shared meanings.** A `componentIcons` value is an
  `IconName` or `null`, never concrete artwork or state presentation.
- **INV4 — Null suppresses a slot.** `componentIcons[slot] = null` intentionally
  renders no icon. An absent mapping uses the component fallback.
- **INV5 — Every slot declares a fallback.** The owning component declares one
  `IconName | null`; themes do not need to repeat defaults.
- **INV6 — Resolution order is stable.** Instance content wins over theme slot
  mapping. Slot mapping chooses a shared name before the shared registry chooses
  artwork. Capability presentation resolves only after one source is selected. A
  malformed theme or process entry is reported and skipped without changing normal
  remaining precedence; selected valid entries never merge nested branches.
- **INV7 — Component slots do not grow the shared name set.** Adding a slot does
  not widen `IconName`.
- **INV8 — Component structure stays with the component.** Source, state
  transitions, transforms, placement, color, interaction, and accessibility remain
  owned by the component that renders the slot. A metadata-bearing role may receive
  a theme default size and theme appearance for its one effective state. Component
  or family policy never supplies appearance or weight.
- **INV9 — Theme lifecycle stays single-owned.** This record defines what a
  `componentIcons` entry and role declaration mean. Theme authoring owns capability
  and role-size normalization and inheritance; theme application owns active-theme
  selection.
- **INV10 — Existing keys coexist.** Shipped slots and extension keys remain
  supported until a separate compatibility decision changes them. New Core slots
  use `ComponentIconSlotMap` and `componentIcons`.
- **INV11 — State participation is explicit and singular.** Only a
  metadata-bearing map value contributes to `ComponentIconStateName`, role-size
  overrides, and state appearance. Its declared precedence contains only its own
  finite state literals and reports zero or one effective state. There is no
  multi-state presentation merge.
- **INV12 — Default pixels do not depend on participation.** A metadata-bearing
  role's contract-default path is pixel-equivalent to the same role without metadata.
  Undeclared components, `true` roles, and themes without icon-capability fields keep
  their established bytes and pixels.

This record does not own:

- `DefineThemeInput`, theme normalization, or `extends`; those belong to the
  theme-authoring architecture;
- active-theme selection; that belongs to the theme-application architecture;
- Icon's public source modes, rendering, visual anatomy, size, color, or
  accessible-name API; those belong to the Icon component contract;
- consumer-authored icon content passed through public component props;
- CSS theming targets for an icon's paint or state;
- stateful indicator renderer replacement; or
- the visual design of a component's chosen glyph.

## Component-local documentation

The architecture record owns the shared rules. The component owner documents
each slot locally.

A component `.doc.mjs` theming entry records:

- the slot name;
- its fallback `IconName | null`;
- a short description of the role and whether `null` may hide it; and
- whether the slot is `true` and stateless or metadata-bearing.

Generated owner metadata for a metadata-bearing role records its component/family
default size, finite literal state vocabulary, and deterministic precedence. The
same declaration drives public state types, theme validation, inspection, visual
inventory, runtime resolution, and built output. The inventory marks every `true` role
stateless/nonparticipating and shows, for each metadata-bearing role and theme, source
mode, component/family and resolved size, finite state vocabulary and precedence,
effective state, appearance, and weight. A component spec records behavior a theme
author must understand, including state transitions, source overrides, placement,
accessibility ownership, default-pixel compatibility, and structural exceptions. It
does not copy the general resolution algorithm or choose theme appearance/weight.

Consumer icon props remain documented as component API. They are not listed as
`componentIcons` slots unless the component also promises a separate stable
theme-level role. Existing `selectedIcon` and `pressedIcon` props stay source
overrides, not state-presentation declarations.

## Change coupling

- Adding a Core slot updates `ComponentIconSlotMap` in the public
  `@astryxdesign/core/Icon` module, its owning component source, local docs,
  resolver tests, and component tests. A `true` value requires only source mapping;
  a metadata-bearing value also supplies generated default-size/state/precedence
  metadata, inventory coverage, type tests, and conformance fixtures.
- Adding a package-owned slot augments the public `@astryxdesign/core/Icon`
  module from that package and adds the same owner-local docs and tests. Existing
  `true` augmentations remain valid and stateless.
- Changing a metadata-bearing role's state vocabulary, precedence, or default size
  updates its generated types, theme validation, runtime/built parity, visual
  inventory, and nonparticipating pixel-baseline fixture together.
- Changing a slot fallback or precedence is a compatibility change because a
  theme may omit the slot and rely on the old result.
- Renaming, removing, or reinterpreting a shipped slot or extension key requires
  an explicit compatibility plan and an allowed breaking-change path when one
  cannot preserve existing behavior.
- Changing the `componentIcons` authoring shape, normalization, or inheritance
  updates the theme-authoring record and its tests. Changing built output updates
  the theme-compilation record and parity tests.
- Changing active-theme selection updates the theme-application record and its
  tests.
- Changing Icon's public source modes or rendering updates the Icon component
  contract and its tests.
- Adding a component-specific key directly to the general Icon API requires
  architecture review; it is not the default way to add a component slot.

## Owning code

- The public `@astryxdesign/core/Icon` subpath owns `ComponentIconSlotMap`,
  `ComponentIconSlotName`, conditional `ComponentIconStateName`, and the public slot
  types that consumers augment.
- Generated component-role metadata owns each participating role's component/family
  default size, finite state vocabulary, and deterministic precedence. Tooling
  projects it into one visual inventory and conformance surface; it does not invent
  role semantics.
- `packages/core/src/Icon/globalIconRegistry.tsx` owns `getIcon`,
  `getExtendedIcon`, `getComponentIconName`, and `getComponentIcon`.
- `packages/core/src/Icon/useIcon.ts` owns active-theme client resolution for
  shared names and component slots.
- The Icon component and its component contract own public source modes,
  rendering, presentation requests, size, color, and accessibility. Components
  resolve their semantic slots and effective state before passing the result to Icon.
- `architecture:theme-authoring-contract` owns `DefineThemeInput`, normalized theme
  data, capability/role-size inheritance, and integration of the separate
  `componentIcons` map.
- `architecture:theme-application` owns active-theme selection and lookup.
- `architecture:theme-compilation` owns preserving normalized theme and role metadata
  in built output.
- Each component owns its slot meaning, fallback, state transitions, placement,
  accessibility, and consumer source-override behavior.
- CLI and docsite tooling expose owner-declared slot metadata without inventing
  new slot semantics.

## Deciding specs

- `spec:AST-054/DEC-3` owns malformed-entry diagnostics and non-throwing
  source-local fallback: a malformed runtime registry entry is reported and skipped
  so normal precedence continues.
- `spec:AST-054/DEC-4` keeps component/family policy structural: source,
  component-default size, and state transitions, never appearance or weight.
- `spec:AST-054/DEC-5` places slot source/effective-state resolution before the
  shared size, appearance, and weight sequence without changing one-argument reads.
- `spec:AST-054/DEC-9` keeps `true` valid, admits metadata-bearing role values,
  derives state names conditionally, and limits each role to one effective state.
- `spec:AST-054/DEC-10` assigns per-role size inheritance, generated visual
  inventory, and conformance to the shared declarations.

## Known conformance and verification gaps

Metadata-bearing slot values, conditional state types, generated default-size/state
metadata, one-effective-state resolution, visual inventory, and conformance enforcement
are accepted but unshipped. The implemented baseline remains `true` slot values,
`componentIcons` name/null mapping, fixed registry entries, and shipped extension-key
compatibility.

## Verification

| Invariant         | Evidence                                                                                                    | Failure signal                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV3, INV6  | Registry resolver tests and rendered fixed/adaptive component fixtures                                      | A component slot resolves concrete artwork directly, skips shared icon resolution, or capability presentation changes source order  |
| INV2, INV5, INV11 | Public type tests, `true`/metadata augmentation fixtures, generated owner metadata, and component docs      | A Core slot is untyped, `true` gains states, metadata states escape the public union, or a role lacks fallback/default/precedence   |
| INV4              | Resolver and component tests with `componentIcons[slot] = null`                                             | A null mapping falls through and still renders an icon                                                                              |
| INV7              | Shared-name type and registry snapshot tests                                                                | Adding a component slot widens `IconName`                                                                                           |
| INV8              | Representative role/state browser and accessibility fixtures                                                | Theme policy moves source/transitions/placement/color/interaction/a11y, component policy chooses appearance/weight, or states merge |
| INV9              | Theme-authoring, application, and compilation owner tests                                                   | This record invents a second normalization or active-theme path                                                                     |
| INV10             | Shipped-key and unresolved-namespaced-key compatibility fixtures                                            | A shipped key changes outcome without a separate compatibility decision                                                             |
| INV12             | Metadata-bearing versus nonparticipating pixel baselines across default theme and omitted capability fields | Participation, a `true` role, or an omitted theme field changes established bytes or pixels                                         |
| Documentation     | Generated CLI/docsite metadata, visual inventory snapshots, and shared-path conformance fixtures            | A role is undiscoverable, inventory differs from runtime, or a component bypasses shared resolution without a conformance failure   |
