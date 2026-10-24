# Typed slots (Swift)

- Status: draft
- Relation: applies AST-082 FR4 (typed slots: text, icon, content) and FR17
  (shared icon names) to Swift. It decides how each slot kind appears in
  SwiftUI; it does not define the kinds.

## Summary

An iOS developer can put an icon in a button, an avatar at the start of a list
row, or any SwiftUI view at its end, the way SwiftUI's own `Label` takes an
icon view, and the component still sizes and orders what it holds, so every
row lines up and reads the same way. Icons are always ones the platform can
draw. The person using the app sees the same parts in the same
places as on the web, read by VoiceOver in the same order.

## Requirements

- **S1 — Each AST-082 slot kind has one Swift form.**
  - A **text** slot is a `String`, the contract's exact type (AST-093 FR5). A
    localizable spelling waits on the component API spec's open question about
    SwiftUI spellings.
  - An **icon** slot is an `IconName` (S2).
  - A **content** slot accepts any SwiftUI view, through a `@ViewBuilder`
    closure (S3). The core's content slot holds named Astryx components; Swift
    accepts this wider form under AST-082 FR4's allowance that a platform may
    accept a wider form for a slot with the same meaning, as the web accepts a
    React node. The component's native additions still name the Astryx
    components the core slot holds, and whether it holds one or many (a row's
    start holds one of `Avatar`, `Icon`, `Thumbnail`; a card holds many).
    Text and icon slots take no wider form (no attributed or localized text, no
    image), so they mean the same thing on Swift as in the core. A free-form web
    prop with no slot kind stays in the web contract only.
- **S2 — Icon names are a string-backed type with the built-ins as members.**
  `IconName` is a `RawRepresentable`, `ExpressibleByStringLiteral`,
  `Hashable`, `Codable`, `Sendable` value. Every built-in semantic name is a
  static member (`.search`, `.close`), generated from core's icon registry. A
  namespaced name (`"acme:rocket"`) is valid once the app registers it in code
  with the image to draw (an SF Symbol name or an asset). An unknown name
  stops a development build with a message naming it, and draws nothing in a
  release build, never a substitute.
- **S3 — Content slots are open, the SwiftUI way.** A content slot is a generic
  `@ViewBuilder` closure parameter (`start: () -> Start` where
  `Start: View`), as in SwiftUI's `Label { } icon: { }`, never `AnyView`. For
  each Astryx component the core slot names, the view also has a convenience
  initializer that takes that component's props directly (for example a row's
  `start: AvatarProps`). The props initializer takes the slot as the matching
  generated node type.
- **S4 — The owner sizes what it holds.** A component proposes the size of
  each slot from its own size and clips or aligns what the slot draws to it,
  whatever view is in it. An Astryx child takes its size from its owner, as
  core does (an `Icon` in a small `IconButton` is small); an explicit size on
  the child wins.
- **S5 — Reading order follows the slots.** VoiceOver reads a component's slots
  in the core contract's order (start, label, description, end), whatever
  views they hold. A decorative
  icon in a slot is hidden unless it carries a label (AST-082 FR17).
- **S6 — Slots are declared, not guessed.** Each component's native additions
  name the slot kind, and for a content slot the Astryx components the core
  slot holds, for every free-form prop it keeps; the contract generator fails
  when a kept free-form prop has none.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1, S6      | The generator test fails on a fixture component whose free-form prop has no slot kind, and produces the Swift form of each kind for a fixture with all three.                                                                          |
| S2          | Every built-in name maps to an SF Symbol that exists on the package's iOS floor; registering `acme:rocket` makes `"acme:rocket"` draw it; an unregistered name stops a development build and draws nothing in release.                 |
| S3          | A compile test passes `Avatar(…)` into a row's start slot through the closure, through the `AvatarProps` convenience initializer, and a plain SwiftUI `Image` through the closure; `AnyView` does not appear in the components module. |
| S4          | A test reads the resolved size of an unsized icon inside a small and a large owner, and the drawn bounds of an oversized SwiftUI view in a row's start slot stay within the slot.                                                      |
| S5          | A UI test reads a row with an avatar, label, description, and an end view in that order, with an Astryx badge and with a plain SwiftUI text at the end.                                                                                |

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
- SwiftUI `Label` (open icon slot): https://developer.apple.com/documentation/swiftui/label
