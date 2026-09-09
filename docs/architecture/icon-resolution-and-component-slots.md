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
deciding_specs: []
---

# Icon resolution and component slots

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

The general resolver chooses artwork in this order:

1. the active theme's `icons[name]` entry;
2. a process-wide `registerIcons()` entry; and
3. a matching entry in `defaultIcons`.

This record does not change which shared or extension keys the general resolver
accepts. Theme application owns how the active theme is selected. Theme
authoring owns how `icons` is normalized and inherited. The Icon component
contract owns its public source modes, rendering, size, color, and accessibility.

### Typed component-owned slots

A component icon slot names a stable purpose inside one component. It does not
name artwork.

The public `@astryxdesign/core/Icon` subpath owns an augmentable map:

```ts
// Public @astryxdesign/core/Icon module
export interface ComponentIconSlotMap {
  'selector-selected-option': true;
}

export type ComponentIconSlotName = keyof ComponentIconSlotMap & string;

export type ComponentIconMap = Partial<
  Record<ComponentIconSlotName, IconName | null>
>;
```

The interface must be declared in the public module that consumers augment. An
interface declared only in an implementation file and re-exported from the
public subpath will not widen the type used by consumers. Runtime resolver code
imports the map from its public owner.

External component packages add their slots by augmenting the same public
`@astryxdesign/core/Icon` module. A slot uses
`<component-kebab>-<semantic-role>`. The role describes why the icon exists, not
its current shape or direction.

`defineTheme({componentIcons})` maps a component slot to a shared `IconName` or
to `null`. It is separate from `defineTheme({icons})`:

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
which artwork draws that shared meaning.

### Component slot precedence

A component resolves an icon-bearing role in this order:

1. a consumer-provided instance prop, when the component exposes one;
2. the nearest active theme's `componentIcons[slot]` entry; and
3. the component's declared fallback `IconName | null`.

`undefined` means “use the next fallback.” `null` means “render no icon.” A
mapped `IconName` continues through shared icon resolution.

Shared resolver modules apply this order consistently:

- `getComponentIconName(slot, fallback, source)` resolves the slot to a shared
  `IconName | null`;
- `getComponentIcon(slot, fallback, source)` resolves that shared name to
  artwork; and
- the client hook resolves the same slot and fallback from the active theme.

Components use these resolvers instead of reading `componentIcons` directly.
The resolver does not own a component's slot name, fallback, or rendering rules.

This record defines the meaning of an active theme's `componentIcons` map. The
theme-authoring architecture owns `DefineThemeInput`, normalization, and
`extends`. Theme compilation owns preserving the normalized map in built output.

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
  unowned Core strings.
- **INV3 — Slots map to shared meanings.** A `componentIcons` value is an
  `IconName` or `null`, never concrete artwork.
- **INV4 — Null suppresses a slot.** `componentIcons[slot] = null` intentionally
  renders no icon. An absent mapping uses the component fallback.
- **INV5 — Every slot declares a fallback.** The owning component declares one
  `IconName | null`; themes do not need to repeat defaults.
- **INV6 — Resolution order is stable.** Instance content wins over theme slot
  mapping. Slot mapping chooses a shared name before the shared registry chooses
  artwork.
- **INV7 — Component slots do not grow the shared name set.** Adding a slot does
  not widen `IconName`.
- **INV8 — Component behavior stays with the component.** State changes,
  transforms, placement, size, color, and accessibility remain owned by the
  component that renders the slot.
- **INV9 — Theme lifecycle stays single-owned.** This record defines what a
  `componentIcons` entry means. Theme authoring owns its normalization and
  inheritance; theme application owns active-theme selection.
- **INV10 — Existing keys coexist.** Shipped slots and extension keys remain
  supported until a separate compatibility decision changes them. New Core slots
  use `ComponentIconSlotMap` and `componentIcons`.

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
- its fallback `IconName | null`; and
- a short description of the role and whether `null` may hide it.

A component spec records behavior that a theme author must understand, such as
state-dependent rendering, placement, accessibility ownership, and compatibility
requirements. It does not copy the general resolution algorithm.

Consumer icon props remain documented as component API. They are not listed as
`componentIcons` slots unless the component also promises a separate stable
theme-level role.

## Change coupling

- Adding a Core slot updates `ComponentIconSlotMap` in the public
  `@astryxdesign/core/Icon` module, its owning component source, local docs,
  resolver tests, and component tests.
- Adding a package-owned slot augments the public `@astryxdesign/core/Icon`
  module from that package and adds the same owner-local docs and tests.
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

- The public `@astryxdesign/core/Icon` subpath owns `ComponentIconSlotMap` and
  the public slot types that consumers augment.
- `packages/core/src/Icon/globalIconRegistry.tsx` owns `getIcon`,
  `getExtendedIcon`, `getComponentIconName`, and `getComponentIcon`.
- `packages/core/src/Icon/useIcon.ts` owns active-theme client resolution for
  shared names and component slots.
- The Icon component and its component contract own public source modes,
  rendering, size, color, and accessibility. Components resolve their semantic
  slots before passing the result to Icon.
- `architecture:theme-authoring-contract` owns `DefineThemeInput`, normalized
  theme data, and `extends`, including integration of the separate
  `componentIcons` map.
- `architecture:theme-application` owns active-theme selection and lookup.
- `architecture:theme-compilation` owns preserving normalized theme data in built
  output.
- Each component owns its slot meaning, fallback, state-dependent rendering,
  accessibility, and consumer override behavior.
- CLI and docsite tooling expose owner-declared slot metadata without inventing
  new slot semantics.

## Deciding specs

None. This record consolidates the existing shared registry behavior and the
approved typed component-slot model.

## Verification

| Invariant        | Evidence                                                        | Failure signal                                                                      |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| INV1, INV3, INV6 | Registry resolver tests and one rendered component fixture      | A component slot resolves concrete artwork directly or skips shared icon resolution |
| INV2, INV5       | Type tests plus component `.doc.mjs` metadata checks            | A Core slot is an untyped string or has no owner/fallback                           |
| INV4             | Resolver and component tests with `componentIcons[slot] = null` | A null mapping falls through and still renders an icon                              |
| INV7             | Shared-name type and registry snapshot tests                    | Adding a component slot widens `IconName`                                           |
| INV8             | Representative Selector and component-owner tests               | A theme must know component rendering details to replace artwork                    |
| INV9             | Theme-authoring, application, and compilation owner tests       | This record invents a second normalization or active-theme path                     |
| INV10            | Shipped-key compatibility fixtures and new-slot negative tests  | A shipped key stops working without a separate compatibility decision               |
| Documentation    | Component metadata and generated CLI/docsite fixtures           | A themeable slot cannot be discovered with its owner, fallback, and purpose         |
