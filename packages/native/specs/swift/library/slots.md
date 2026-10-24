# Typed slots (Swift)

- Status: draft
- Relation: extends AST-082 FR4 ("the core expresses content as a typed slot
  instead, such as text, an icon, or a named Astryx component") and FR17
  (semantic icon names). It decides how each slot kind appears in Swift.

## Summary

An iOS developer can put an icon in a button, an avatar at the start of a list
row, or a badge at its end, and the compiler accepts only what that slot
allows, so a row never shows a stray control and every icon is one the
platform can draw. The person using the app sees the same parts in the same
places as on the web, read by VoiceOver in the same order.

## Requirements

- **S1 — Four slot kinds.** A core prop whose web type is free-form content is
  given exactly one slot kind in the component's native additions:
  - `text`: words, a `String` (with a `LocalizedStringResource` spelling, per
    the component API spec);
  - `icon`: an `AstryxIconName` (S2);
  - `component`: one of a closed list of named Astryx components, such as
    `Avatar | Icon | Thumbnail`;
  - `content`: child Astryx components in order, as `Card` takes today.
    A free-form prop with no slot kind stays in the web contract only.
- **S2 — Icon names are a closed, extensible set.** `AstryxIconName` holds every
  built-in semantic icon name, generated from core's icon registry, plus
  namespaced names `<library>:<name>` that an app registers in code with the
  image to draw (an SF Symbol name or an asset). A name the app has not
  registered fails at registration time in development and draws nothing in
  release, never a substitute.
- **S3 — Component slots are generic and constrained.** A `component` slot is a
  `@ViewBuilder` parameter whose type is constrained to the listed Astryx
  views, never `AnyView` and never an arbitrary `View`. The props initializer
  takes the slot as the matching generated node type.
- **S4 — The owner sizes what it holds.** A component that holds an icon or a
  component in a slot sets that child's size from its own size, as core does
  (an `Icon` in a small `IconButton` is small). An explicit size on the child
  wins.
- **S5 — Reading order follows the slots.** VoiceOver reads a component's slots
  in the core contract's order (start, label, description, end). A decorative
  icon in a slot is hidden unless it carries a label (AST-082 FR17).
- **S6 — Slots are declared, not guessed.** Each component's native additions
  name the slot kind for every free-form prop it keeps; the contract generator
  fails when a kept free-form prop has none.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1, S6      | The generator test fails on a fixture component whose free-form prop has no slot kind, and produces each of the four Swift forms for a fixture with all four.                                           |
| S2          | Every built-in name maps to an SF Symbol that exists on the package's iOS floor; registering `acme:rocket` makes `.custom("acme:rocket")` draw it; an unregistered name triggers a development failure. |
| S3          | A compile test passes an `AstryxAvatar` into a row's start slot and fails to compile when passing a SwiftUI `Toggle`.                                                                                   |
| S4          | A test reads the resolved size of an unsized icon inside a small and a large owner.                                                                                                                     |
| S5          | A UI test reads a row with an avatar, label, description, and badge in that order.                                                                                                                      |

## Current state

- The contract generator knows two slot kinds, `text` and `content`; an icon
  prop has no portable form, so the icon props of Button and Badge are
  web-only.
- The built-in icon names map to SF Symbols in TypeScript only.

## Open questions

- **OQ1 — Is `component` the right fourth kind, or should each named component
  be its own kind?** Recommendation: one `component` kind with a closed list
  per slot, because the list differs by slot (a row's start takes
  `Avatar | Icon | Thumbnail`; its end takes `Badge | Icon | Text`).

## References

- HIG, SF Symbols: https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- `ViewBuilder`: https://developer.apple.com/documentation/swiftui/viewbuilder
