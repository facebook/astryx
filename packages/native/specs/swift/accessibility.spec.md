---
schema_version: 1
template_version: 3
kind: architecture
id: architecture:native-swift-accessibility
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-23
owners: [cixzhang]
applies_to: [packages/native/]
verified_by: [.github/scripts/native-swift.sh]
deciding_specs:
  [
    spec:AST-093/FR3,
    spec:AST-093/FR5,
    spec:AST-085,
    spec:AST-086,
    spec:AST-082/FR17,
  ]
---

# Accessibility architecture (Swift)

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governing contract      | Each component's core accessibility contract, `spec:AST-085`, `spec:AST-086`, and `spec:AST-093` FR3 and FR5, carried to VoiceOver and Apple's accessibility settings.                        |
| System behavior         | Name, role, state, and value come from the core contract; disabled controls stay reachable; covered messages announce once after load; every setting in X6 is honored.                        |
| End-user impact         | A VoiceOver user on iPhone hears the same name, role, state, and messages as a screen-reader user on the web; people using Reduce Motion, Bold Text, and the other settings get them honored. |
| Builder impact          | A Swift component author maps the core contract to SwiftUI accessibility APIs by these rules instead of deciding them per component.                                                          |
| Compatibility/readiness | Draft. No Swift component yet has accessibility tests or an audit.                                                                                                                            |
| Review checks           | Reject a Swift component that renames a core accessible name or role, drops a disabled control from VoiceOver, announces a message present at load, or ignores a setting X6 lists.            |
| Governing rules         | `spec:AST-093/FR3`, `spec:AST-093/FR5`, `spec:AST-085`, `spec:AST-086` FR5, FR6, and FR11, `spec:AST-082/FR17`.                                                                               |

This table is a review projection; the body below is authoritative.

## Purpose

A VoiceOver user hears the same name, role, state, and messages from an Astryx
component on iPhone as a screen-reader user hears on the web: a message that
appears is announced once, and one already on screen when it opens is not.
People who turn on Reduce Motion, Reduce Transparency, Bold Text, Button
Shapes, or Differentiate Without Color get components that honor each setting.

## System model

Every Swift component in `@astryxdesign/native` implements a core component
contract. The contract names each part's accessible name, role, state, value,
and messages. A Swift component maps those to SwiftUI's accessibility APIs and
to Apple's accessibility settings by the rules below. The core records decide
what is said; this record decides how Swift says it.

## Boundaries and invariants

- **X1 — Name, role, and state come from the core contract.** The contract's
  accessible name becomes `accessibilityLabel`, its role becomes the matching
  trait (`.isButton`, `.isHeader` with `accessibilityHeading`, `.isToggle`,
  `.isSelected`, `.isLink`), and its value becomes `accessibilityValue`. A
  component built on a SwiftUI control keeps that control's own traits and
  adds none that duplicate them. A custom control that has a system
  counterpart exposes it with `accessibilityRepresentation`.
- **X2 — Disabled controls stay reachable (`spec:AST-085`).** A disabled
  control stays in the VoiceOver order and is read as dimmed. When the
  contract gives a reason, it is the control's `accessibilityHint`.
- **X3 — Announcements follow `spec:AST-086`.** A component AST-086 FR11
  covers announces its own message with `AccessibilityNotification.Announcement`
  once when it appears or its words change after its screen has loaded, and
  not when it is present as the screen loads, except a message that VoiceOver
  can reach only through its announcement, which announces even as the screen
  loads (FR11). Errors and time-critical failures are announced at high
  priority (FR5), and re-rendering the same message does not announce it again
  (FR6). Banner, FieldStatus, and a grouped field's status keep their own
  rules, as FR11 says: Banner's status is visual only and the Banner never
  announces itself; the app announces an outcome when it happens
  (`component:Banner` FR8).
- **X4 — Icons are decorative unless labeled (`spec:AST-082/FR17`).** An icon
  is hidden from VoiceOver unless it carries a label. An icon-only control
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

## Change coupling

A change to a Swift component's accessibility modifiers, its animations, or
its colors and shapes is reviewed against X1–X7. A change to the core
accessibility contract of a component, or to `spec:AST-085` or
`spec:AST-086`, is reviewed for its effect here. The checks in Verification
prove the record stays current.

## Owning code

- `packages/native/` — Swift components and their test targets, which carry
  X1–X7 and the checks that prove them.

## Deciding specs

- `spec:AST-093/FR3` — Apple platforms follow the Human Interface Guidelines,
  including VoiceOver and the accessibility settings.
- `spec:AST-093/FR5` — every native component change ships with accessibility
  evidence.
- `spec:AST-085` — disabled controls stay focusable and say why.
- `spec:AST-086` — status messages announce once, at the priority their
  severity sets.
- `spec:AST-082/FR17` — icons share names and are decorative unless labeled.

## Verification

| Invariant | Evidence                                                                                                                                                                                                                                                                                                                                                                                                     | Failure signal                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| X1        | Unit tests assert each component's label, traits, and value in every state its contract names.                                                                                                                                                                                                                                                                                                               | A label, trait, or value differs from the core contract in some state.                             |
| X2        | A test disables a focused control and finds it still focused, read as dimmed, with its reason as the hint.                                                                                                                                                                                                                                                                                                   | A disabled control leaves the VoiceOver order or loses its reason.                                 |
| X3        | A test shows a covered component's message after load and observes exactly one announcement, at high priority for an error; a time-critical failure is also high priority; a second render announces nothing; the same message present at load announces nothing; a Banner shown after load announces nothing. A message VoiceOver can reach only through its announcement, present at load, announces once. | An announcement is missing, repeated, at the wrong priority, or made by a component that must not. |
| X4, X5    | A UI test runs `performAccessibilityAudit()` on a screen of every component at the default and largest text sizes, with no failures.                                                                                                                                                                                                                                                                         | The audit reports an unlabeled icon control, a split element, or a gesture-only action.            |
| X6        | Captures under Reduce Motion show no movement; under Reduce Transparency, opaque surfaces; under Bold Text, heavier text in every component; under Differentiate Without Color, every state shown by color also shows a shape, an icon, or a word; under Button Shapes, every control drawn without a visible edge shows one.                                                                                | A capture under a setting shows the default treatment.                                             |
| X7        | The audit's hit-region check passes for every control.                                                                                                                                                                                                                                                                                                                                                       | A control's hit region is smaller than 44 by 44 points.                                            |

No Swift component has accessibility tests or an audit yet, so every row is
unproven until the first component ships its tests.

Open question: who words the spoken status and state? Recommendation: the
library, in its own String Catalog, with the same meaning as core's default
strings on the web.

References: Apple's Human Interface Guidelines pages on
[Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
and [VoiceOver](https://developer.apple.com/design/human-interface-guidelines/voiceover);
[`accessibilityRepresentation`](<https://developer.apple.com/documentation/swiftui/view/accessibilityrepresentation(representation:)>);
[`AccessibilityNotification.Announcement`](https://developer.apple.com/documentation/accessibility/accessibilitynotification/announcement).
