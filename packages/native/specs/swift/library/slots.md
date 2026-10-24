# Typed slots (Swift)

- Status: draft
- Relation: applies AST-082 FR4 (typed slots: text, icon, content) and FR17
  (shared icon names) to Swift. It decides how each slot kind appears in
  SwiftUI; it does not define the kinds.

## Summary

An iOS developer can put an icon in a button, an avatar at the start of a list
row, or a badge at its end, and the compiler accepts only what that slot
allows, so a row never shows a stray control and every icon is one the
platform can draw. The person using the app sees the same parts in the same
places as on the web, read by VoiceOver in the same order.

## Requirements

- **S1 — Each AST-082 slot kind has one Swift form.**
  - A **text** slot is a `String`, with a `LocalizedStringResource` spelling
    as the component API spec gives every word.
  - An **icon** slot is an `AstryxIconName` (S2).
  - A **content** slot holds named Astryx components. Its component's native
    additions list which ones it accepts, and whether it holds one or many
    (a row's start holds one of `Avatar`, `Icon`, `Thumbnail`; a card holds
    many of any).
    A free-form web prop with no slot kind stays in the web contract only.
- **S2 — Icon names are a string-backed type with the built-ins as members.**
  `AstryxIconName` is a `RawRepresentable`, `ExpressibleByStringLiteral`,
  `Hashable`, `Codable`, `Sendable` value. Every built-in semantic name is a
  static member (`.search`, `.close`), generated from core's icon registry. A
  namespaced name (`"acme:rocket"`) is valid once the app registers it in code
  with the image to draw (an SF Symbol name or an asset). An unknown name
  stops a development build with a message naming it, and draws nothing in a
  release build, never a substitute.
- **S3 — Content slots are constrained generics.** A content slot is a
  `@ViewBuilder` parameter whose type accepts only the listed Astryx views,
  never `AnyView` and never an arbitrary `View`. The props initializer takes
  the slot as the matching generated node type.
- **S4 — The owner sizes what it holds.** A component that holds an icon or a
  component in a slot sets that child's size from its own size, as core does
  (an `Icon` in a small `IconButton` is small). An explicit size on the child
  wins.
- **S5 — Reading order follows the slots.** VoiceOver reads a component's slots
  in the core contract's order (start, label, description, end). A decorative
  icon in a slot is hidden unless it carries a label (AST-082 FR17).
- **S6 — Slots are declared, not guessed.** Each component's native additions
  name the slot kind, and for a content slot its accepted components, for every free-form prop it keeps; the contract generator
  fails when a kept free-form prop has none.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1, S6      | The generator test fails on a fixture component whose free-form prop has no slot kind, and produces each of the four Swift forms for a fixture with all four.                                                          |
| S2          | Every built-in name maps to an SF Symbol that exists on the package's iOS floor; registering `acme:rocket` makes `"acme:rocket"` draw it; an unregistered name stops a development build and draws nothing in release. |
| S3          | A compile test passes an `AstryxAvatar` into a row's start slot and fails to compile when passing a SwiftUI `Toggle`.                                                                                                  |
| S4          | A test reads the resolved size of an unsized icon inside a small and a large owner.                                                                                                                                    |
| S5          | A UI test reads a row with an avatar, label, description, and badge in that order.                                                                                                                                     |

## Current state

- The contract generator knows two slot kinds, `text` and `content`; an icon
  prop has no portable form, so the icon props of Button and Badge are
  web-only.
- The built-in icon names map to SF Symbols in TypeScript only.

## Open questions

None.

## References

- HIG, SF Symbols: https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- `ViewBuilder`: https://developer.apple.com/documentation/swiftui/viewbuilder
