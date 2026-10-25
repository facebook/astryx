---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-099
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-24
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:react-component-runtime]
affects_families: []
affects_contributing: []
affects_consumer_docs: [packages/cli/assets/docs/browser-support.doc.mjs]
---

# On-screen keyboard system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": ["packages/core/src/BottomSheet/**"]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A person typing on a phone sees the field they are typing in, and the surface
around it, above the on-screen keyboard, and the page does not lurch when a
field takes focus. Every surface that responds to the keyboard measures it the
same way and keeps the page still, so the keyboard behaves the same in a sheet,
a chat composer, or a search field.

## Non-goals

- Layer geometry: how Popover and other anchor-mode layers stay above the
  keyboard belongs to `spec:AST-059`.
- Hardware keyboard access and focus order, owned by `spec:AST-025`,
  `spec:AST-020`, and component records.
- The curve or timing of an animation that moves a surface with the keyboard.
  Such an animation is optional polish; under reduced motion it follows
  `design:reduced-motion`.
- The app's viewport `<meta>` element, which the app owns.
- `@astryxdesign/native`, where the platform's own keyboard avoidance applies
  (`spec:AST-082` FR11).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One keyboard height for every component.** Every Core and Lab
  component that positions, sizes, or dismisses relative to the on-screen
  keyboard responds to the same FR2 height at the same moment, including
  BottomSheet, the chat composer, a search field placed at the bottom, tab bar
  search, drag to dismiss, and any keyboard layout guide, so no two components disagree about where the
  keyboard is. `architecture:react-component-runtime` INV11 owns the single
  source of that height and how a component outside Core conforms.
- **FR2 — The height a pan or a zoom cannot corrupt.** The keyboard height is
  the layout viewport height minus the visual viewport height multiplied by the
  visual viewport's scale, in CSS pixels. It is 0 when no keyboard is shown,
  including while the page is pinch-zoomed. A page pan or a visual-viewport
  offset is a pan to put back (FR4), never a smaller keyboard.
- **FR3 — The keyboard height stays internal and keeps layout correct.** No
  public CSS custom property, export, or prop exposes the keyboard height.
  Each component applies it on its own element, such as a bottom offset, a
  padding, or a maximum height, so layout is correct with no animation running:
  the chat composer, a search field placed at the bottom, and tab bar search
  position from it, and a fully expanded sheet extends its own scroll range by
  it. How the value reaches styles is
  `architecture:react-component-runtime` INV11. An animation that rides the
  keyboard is optional and layers on top of that layout. Each keyboard change is published, as
  the hook's value, as one transition: a start time, a resting value, and a
  curve. Every consumer, such as the composer, a scroll view, and a header,
  rides that same transition with compositor animations, a translate to the
  resting value, never JavaScript per frame, so they move in sync; each commits
  the resting value once to layout, as an offset, a padding, or a spacer, so
  nothing is hidden or unscrollable, with at most one layout read per keyboard
  change. The transition is internal like the height: no public API or CSS
  custom property exposes it.
- **FR4 — Focus never pans the page.** Every route into a text-entry control
  inside a keyboard-aware surface, including a tap, the keyboard's
  previous and next buttons, Tab, and programmatic focus, delivers focus
  without the browser scrolling the document, and the surface brings the
  control into view with its own scroller. When the keyboard's Done button
  ends entry, focus moves to the surface so the next tap is handled the same
  way. A document scroll that still happens while the page is scroll-locked,
  such as on returning to the app, is put back in the same frame.
- **FR5 — Moving a surface dismisses the keyboard.** When a surface that holds
  the focused control starts to move, such as a sheet dragged between heights,
  a drag to dismiss, or a close, the control is blurred so the keyboard
  dismisses, and the surface keeps its keyboard layout until the visual
  viewport has recovered, so content does not jump on the first frame of the
  move.
- **FR6 — Capability detection.** Keyboard handling acts where the visual viewport
  shrinks for the keyboard while the layout viewport keeps its height. It
  detects that from the platform's viewport and keyboard capabilities, never
  from the user agent (`spec:AST-013` FR6). Where the platform exposes its own
  keyboard geometry API (the Android path, FR8), Astryx neither measures nor
  claims focus, and the keyboard height stays 0.
- **FR7 — Top-level documents only.** Inside an iframe the frame's visual
  viewport does not change when the keyboard opens, so the keyboard height is
  0 there and nothing changes. Behavior and evidence for this record come
  from a top-level document.
- **FR8 — Android follows FR6 and the app's viewport setting.** Chrome on
  Android exposes its own keyboard geometry API, so under FR6 Astryx neither
  measures nor claims focus there; its documented path is the app's viewport
  setting `interactive-widget=resizes-content`, under which the layout viewport
  itself shrinks above the keyboard and layout follows with no keyboard inset.
  The app owns that setting; Astryx documents it and does not set it. An
  Android browser without that API that shrinks only its visual viewport, such
  as Firefox for Android, gets FR2–FR5 under FR6.

### Platform support

- Supported feature/engine floor: the package's supported browsers
  (`spec:AST-013` FR3). FR2–FR5 apply to Safari on iOS, in the browser and as a
  home-screen app; FR8 applies to Chrome on Android.
- Unsupported behavior: with no on-screen keyboard, or no visual-viewport
  support, the keyboard height is 0 and nothing changes. During server render it
  renders nothing and reads no viewport.
- Browser evidence: Safari on iOS, in the iOS Simulator or on a device and in a
  top-level document, proves the iOS claims of FR2–FR5, and Chrome on Android,
  in an emulator or on a device, proves FR8 (`spec:AST-013` FR10); DOM and
  visual-viewport tests prove the rest of FR1–FR7. A pass on a physical
  iPhone and a physical Android phone is recommended follow-up evidence (OQ1).

## Current-state impact

- BottomSheet's internal keyboard hook implements FR2, FR4, and FR5 for a
  fully expanded Tall sheet on iOS, detects iOS from the user agent, and writes
  a private inset on the sheet body as the custom property
  `--_sheet-keyboard-inset`, which retires: the sheet applies the height
  through a functional style on its own element. It becomes the single source
  `architecture:react-component-runtime` INV11 names: FR6 replaces the
  user-agent check, FR3 keeps the height internal, and BottomSheet consumes the
  shared source (`component:BottomSheet`).
- No other component on `main` measures the keyboard. A component that later
  responds to the keyboard uses the same height (FR1).
- Layer caps do not account for the keyboard: `spec:AST-059` owns layer
  geometry, and keeping Popover and other anchor-mode layers above the keyboard
  is an amendment to that record that consumes this height.
- Today's hook omits FR2's zoom term, so a pinch-zoomed page reads as a
  keyboard; FR2 corrects that.
- On Android, a fully expanded Tall sheet loses its keyboard inset under FR6
  and FR8: Android follows the app's viewport setting instead.
- No public API exposes the keyboard height, and FR3 keeps it that way.
- The consumer documentation gains the Android viewport setting (FR8).

## Verification

| Contract | Verification                                                                                                   | Representative states                                                                                                                                                                        | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | Source boundary check over Core and Lab plus a shared test that drives one keyboard change                     | each listed consumer; a new keyboard-aware component                                                                                                                                         | Two components reading different heights for one keyboard, or a component measuring by a rule other than FR2                                                                                                                                                                                                                                                                                  |
| FR2      | Module tests driving visual-viewport resize and scroll events                                                  | keyboard shown; hidden; page panned with the keyboard shown; offset without a keyboard; page pinch-zoomed with and without the keyboard                                                      | A pan that lowers the reported height, or a height when no keyboard is shown                                                                                                                                                                                                                                                                                                                  |
| FR3      | Consumer tests of computed layout, plus a public-surface check                                                 | keyboard shown and hidden; composer, bottom search field, tab bar search, Tall sheet; no animation running; a ride animation running with the composer, a scroll view, and a header together | A consumer whose layout ignores the height, layout that is only correct after an animation, or a public CSS custom property, export, or prop for the height, consumers moving out of sync on one keyboard change, motion driven by JavaScript per frame or animating a layout property, more than one layout read per keyboard change, or content hidden or unscrollable at the resting value |
| FR4      | Focus-route tests with document scroll spies                                                                   | tap, previous and next buttons, Tab, programmatic focus, Done then tap, app resume while scroll-locked                                                                                       | A route that scrolls the document, or a slipped scroll left in place                                                                                                                                                                                                                                                                                                                          |
| FR5      | Surface move tests                                                                                             | sheet drag between heights, drag to dismiss, close, with a focused field                                                                                                                     | The field stays focused after a move starts, or content jumps on the first frame                                                                                                                                                                                                                                                                                                              |
| FR6      | Capability tests with the user agent varied                                                                    | visual viewport shrinking with a fixed layout viewport; platform keyboard geometry API present; neither                                                                                      | Behavior that changes with the user agent alone, or measurement where the platform geometry API applies                                                                                                                                                                                                                                                                                       |
| FR7      | Tests in an iframe and in a top-level document                                                                 | the same keyboard event sequence in both                                                                                                                                                     | A non-zero value or a claimed focus inside an iframe                                                                                                                                                                                                                                                                                                                                          |
| FR8      | Consumer documentation check plus Chrome on Android, emulator or device, with and without the viewport setting | the documented viewport setting and its effect                                                                                                                                               | Astryx setting the viewport meta, the setting missing from the docs, or, in Chrome on Android with the setting, a focused field ending under the keyboard or a non-zero keyboard height                                                                                                                                                                                                       |
| FR8      | Firefox for Android, emulator or device, top-level document                                                    | focus routes with the keyboard shown and hidden                                                                                                                                              | The page lurches or the field ends under the keyboard                                                                                                                                                                                                                                                                                                                                         |
| FR2–FR5  | Safari on iOS in the iOS Simulator or on a device, top-level document                                          | focus routes, keyboard shown and hidden, page panned and pinch-zoomed, a sheet moved, in Safari and as a home-screen app                                                                     | The page lurches, the field ends under the keyboard, or the height is wrong after a pan or zoom                                                                                                                                                                                                                                                                                               |
| FR2–FR5  | Recommended follow-up: physical devices in a top-level document (OQ1)                                          | iPhone Safari with the toolbar expanded and collapsed; iPhone home-screen app; Android Chrome with `interactive-widget=resizes-content`                                                      | The page lurches, the field ends under the keyboard, or the surface does not follow the keyboard                                                                                                                                                                                                                                                                                              |

## Decision log

### DEC-1 — One keyboard height for every component, measured so a pan cannot corrupt it

**Reference:** `spec:AST-099/DEC-1`
**Decider:** `cixzhang`, `2026-10-24`

BottomSheet's keyboard hook already keeps a fixed surface still on every focus
route and measures the keyboard so a page pan cannot shrink it, which are the
two failures that leave a field under the keyboard. Making it the one source
Core components use, and the definition a component outside Core measures by,
keeps components from drifting into different measurements. Applying the
hook's height through StyleX functional styles keeps layout correct with no
animation and keeps the shared API constrained: the height stays internal, and
an app that later needs it gets a deliberate public-API decision rather than a
variable it came to rely on.
Animation stays optional polish on top.

Rejected: each component measuring the keyboard by its own rule and predicting its motion, which pans with any unclaimed focus route and diverges; a public CSS custom property for the height, which a hook-derived value does not need.

## Open questions

- **OQ1 — Do physical-device passes gate merge?** (`human-design`) Safari on
  iOS and Chrome on Android evidence gate (`spec:AST-013` FR10), and a physical iPhone and Android
  phone pass is recommended follow-up. Options: accept Safari in the iOS
  Simulator and Chrome in an Android emulator as the gate; or require a
  physical iPhone and a physical Android phone pass in a top-level document
  before this record's implementation merges.
