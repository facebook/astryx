# Accessibility contract (Swift)

- Status: draft
- Relation: extends AST-093 FR3 and FR5. Applies the core accessibility
  records AST-085 (focusable disabled controls) and AST-086 (status
  announcements) to VoiceOver and Apple's accessibility settings.

## Summary

A VoiceOver user hears the same name, role, state, and messages from an Astryx
component on iPhone as a screen-reader user hears on the web: an error banner
is spoken as an error, and a message that appears is announced once. People
who turn on Reduce Motion, Reduce Transparency, Bold Text, Button Shapes, or
Differentiate Without Color get components that honor each setting.

## Requirements

- **X1 — Name, role, and state come from the core contract.** The contract's
  accessible name becomes `accessibilityLabel`, its role becomes the matching
  trait (`.isButton`, `.isHeader` with `accessibilityHeading`, `.isToggle`,
  `.isSelected`, `.isLink`), and its value becomes `accessibilityValue`. A
  component built on a SwiftUI control keeps that control's own traits and
  adds none that duplicate them. A custom control that has a system
  counterpart exposes it with `accessibilityRepresentation`.
- **X2 — Disabled controls stay reachable (AST-085).** A disabled control stays
  in the VoiceOver order and is read as dimmed. When the contract gives a
  reason, it is the control's `accessibilityHint`.
- **X3 — Status is spoken (AST-086).** A status (info, warning, error, success)
  is part of the spoken label, never only an icon or a color. A message that
  appears after its screen has loaded is announced once with
  `AccessibilityNotification.Announcement`; errors are announced at high
  priority. Re-rendering the same message does not announce it again.
- **X4 — Icons are decorative unless labeled (AST-082 FR17).** An icon is
  hidden from VoiceOver unless it carries a label. An icon-only control
  requires a label.
- **X5 — One element per thing a person reads.** A component that reads as one
  thing, such as a banner or a list row, is one accessibility element. Every
  action reachable only by a gesture (swipe, long press, drag) is also an
  `accessibilityAction`.
- **X6 — Settings are honored.**
  - Reduce Motion: movement becomes a cross-fade or no animation.
  - Reduce Transparency: translucent surfaces become opaque.
  - Bold Text: weights come from system or text-style fonts, so they follow
    `legibilityWeight`.
  - Differentiate Without Color: every state shown by color also has a shape,
    an icon, or a word.
  - Button Shapes: controls drawn without a visible edge show one.
- **X7 — Targets are at least 44 by 44 points,** even when the drawn control is
  smaller.
- **X8 — Library words are localized.** Words the library adds for
  accessibility ("Error", "Loading", "Dimmed" reasons) come from the package's
  own String Catalog.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X1          | Unit tests assert each component's label, traits, and value in every state its contract names.                                                                                                                                   |
| X2          | A test disables a focused control and finds it still focused, read as dimmed, with its reason as the hint.                                                                                                                       |
| X3          | A test shows a banner after load and observes exactly one announcement, at high priority for an error; a second render of the same banner announces nothing.                                                                     |
| X4, X5      | A UI test runs `performAccessibilityAudit()` on a screen of every component at the default and largest text sizes, with no failures.                                                                                             |
| X6          | Captures under Reduce Motion show no movement; under Reduce Transparency, opaque surfaces; under Differentiate Without Color, every status shows its icon and word; under Button Shapes, every borderless control shows an edge. |
| X7          | The audit's hit-region check passes for every control.                                                                                                                                                                           |
| X8          | Switching the locale changes the library's spoken words.                                                                                                                                                                         |

## Current state

- The Banner view hides its status icon and combines its children, so
  VoiceOver reads the title with no "Error" or "Warning", and nothing is
  announced when a banner appears.
- The Heading view sets the heading trait and level, and the TextInput view
  uses its visible label as the field's name.
- No component has accessibility tests or an audit.

## Open questions

- **OQ1 — Who words the spoken status and state?** Recommendation: the library,
  in its own String Catalog, with the same meaning as core's default strings
  on the web.

## References

- HIG, Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- HIG, VoiceOver: https://developer.apple.com/design/human-interface-guidelines/voiceover
- `accessibilityRepresentation`: https://developer.apple.com/documentation/swiftui/view/accessibilityrepresentation(representation:)
- `AccessibilityNotification.Announcement`: https://developer.apple.com/documentation/accessibility/accessibilitynotification/announcement
- WWDC24, Catch up on accessibility in SwiftUI: https://developer.apple.com/videos/play/wwdc2024/10073/
- WWDC23, Perform accessibility audits for your app: https://developer.apple.com/videos/play/wwdc2023/10035/
