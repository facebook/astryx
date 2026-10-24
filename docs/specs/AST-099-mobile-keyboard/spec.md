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
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: []
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
field takes focus. One shared core keyboard module measures the keyboard and
keeps the page still, and every surface that responds to the keyboard uses it,
so the keyboard behaves the same way in a sheet, a chat composer, a search
field, or a popover.

## Non-goals

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

- **FR1 — One shared keyboard module.** Core has one keyboard module that
  measures the on-screen keyboard (FR2), exposes its height (FR3), keeps the
  page from panning (FR4), and dismisses the keyboard when a surface moves
  (FR5). Every Core and Lab component that positions, sizes, or dismisses
  relative to the on-screen keyboard uses it, including BottomSheet, the chat
  composer, a search field placed at the bottom, tab bar search, Popover's
  keyboard avoidance, drag to dismiss, and any keyboard layout guide. No
  component keeps its own keyboard measurement or its own visual-viewport
  listener for the keyboard.
- **FR2 — The height a pan cannot corrupt.** The keyboard height is the layout
  viewport height minus the visual viewport height, in CSS pixels, and 0 when
  no keyboard is shown. A page pan or a visual-viewport offset is a pan to put
  back (FR4), never a smaller keyboard.
- **FR3 — The hook is the only source of the keyboard height.** The module's
  hook returns the FR2 height, and that is the only way the height reaches
  layout. Inside Core the module holds it in an internal StyleX variable that
  Core does not export, and each consumer applies the hook's value through a
  StyleX functional style on its own element, such as a bottom offset, a
  padding, or a maximum height, so layout is correct with no animation running:
  the chat composer, a search field placed at the bottom, and tab bar search
  position from it, Popover caps its height with it, and a fully expanded sheet
  extends its own scroll range by it. No consumer reads a global CSS variable
  for it, and no public CSS custom property, export, or prop exposes it. An
  animation that rides the keyboard is optional and layers on top of that
  layout.
- **FR4 — Focus never pans the page.** Every route into a text-entry control
  inside a surface that uses the module, including a tap, the keyboard's
  previous and next buttons, Tab, and programmatic focus, delivers focus
  without the browser scrolling the document, and the surface brings the
  control into view with its own scroller. When the keyboard's Done button
  ends entry, focus moves to the surface so the next tap is handled the same
  way. A document scroll that still happens while the page is scroll-locked,
  such as on returning to the app, is put back in the same frame.
- **FR5 — Moving a surface dismisses the keyboard.** When a surface that holds
  the focused control starts to move, such as a sheet dragged between heights,
  a drag to dismiss, or a close, the module blurs the control so the keyboard
  dismisses, and the surface keeps its keyboard layout until the visual
  viewport has recovered, so content does not jump on the first frame of the
  move.
- **FR6 — Capability detection.** The module acts where the visual viewport
  shrinks for the keyboard while the layout viewport keeps its height. It
  detects that from the platform's viewport and keyboard capabilities, never
  from the user agent (`spec:AST-013` FR6). Where the platform exposes its own
  keyboard geometry API (the Android path, FR8), the module neither measures
  nor claims focus, and the hook's height stays 0.
- **FR7 — Top-level documents only.** Inside an iframe the frame's visual
  viewport does not change when the keyboard opens, so the module reports
  0 there and changes nothing. Behavior and evidence for this record come
  from a top-level document.
- **FR8 — Android follows the app's viewport setting.** On Android the
  documented path is the app's viewport setting
  `interactive-widget=resizes-content`, under which the layout viewport itself
  shrinks above the keyboard and layout follows with no keyboard inset. The
  app owns that setting; Astryx documents it and does not set it. Without it,
  Astryx adds no Android keyboard handling.

### Platform support

- Supported feature/engine floor: the package's supported browsers
  (`spec:AST-013` FR3). FR2–FR5 apply to Safari on iOS, in the browser and as a
  home-screen app; FR8 applies to Chrome on Android.
- Unsupported behavior: with no on-screen keyboard, or no visual-viewport
  support, the hook reports 0 and does nothing. During server render it
  renders nothing and reads no viewport.
- Browser evidence: DOM and visual-viewport tests prove FR1–FR7 in a top-level
  document. Physical-device passes are recommended `spec:AST-009` follow-up
  evidence, not a merge or release requirement.

## Current-state impact

- BottomSheet's internal keyboard hook implements FR2, FR4, and FR5 for a
  fully expanded Tall sheet on iOS, detects iOS from the user agent, and writes
  a private inset on the sheet body. Under this record it becomes the shared
  module: FR6 replaces the user-agent check, FR3 holds the height in an internal
  StyleX variable that consumers apply through functional styles, and
  BottomSheet consumes the module (`component:BottomSheet`).
- No other component on `main` measures the keyboard. A component that later
  responds to the keyboard does so through the module (FR1).
- No public API exposes the keyboard height, and FR3 keeps it that way.
- The consumer documentation gains the Android viewport setting (FR8).

## Verification

| Contract | Verification                                                                                 | Representative states                                                                                                                   | Mutation or failure expectation                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1      | Import and source boundary check over Core and Lab                                           | each listed consumer; a new keyboard-aware component                                                                                    | A component with its own keyboard measurement or visual-viewport keyboard listener                                                                                                               |
| FR2      | Module tests driving visual-viewport resize and scroll events                                | keyboard shown; hidden; page panned with the keyboard shown; offset without a keyboard                                                  | A pan that lowers the reported height, or a height when no keyboard is shown                                                                                                                     |
| FR3      | Module and consumer tests of the hook value and computed layout, plus a public-surface check | keyboard shown and hidden; composer, bottom search field, tab bar search, Popover, Tall sheet; no animation running                     | A consumer that positions without the hook value or reads a global CSS variable, layout that is only correct after an animation, or a public CSS custom property, export, or prop for the height |
| FR4      | Focus-route tests with document scroll spies                                                 | tap, previous and next buttons, Tab, programmatic focus, Done then tap, app resume while scroll-locked                                  | A route that scrolls the document, or a slipped scroll left in place                                                                                                                             |
| FR5      | Surface move tests                                                                           | sheet drag between heights, drag to dismiss, close, with a focused field                                                                | The field stays focused after a move starts, or content jumps on the first frame                                                                                                                 |
| FR6      | Capability tests with the user agent varied                                                  | visual viewport shrinking with a fixed layout viewport; platform keyboard geometry API present; neither                                 | Behavior that changes with the user agent alone, or measurement where the platform geometry API applies                                                                                          |
| FR7      | Tests in an iframe and in a top-level document                                               | the same keyboard event sequence in both                                                                                                | A non-zero value or a claimed focus inside an iframe                                                                                                                                             |
| FR8      | Consumer-doc check                                                                           | the documented viewport setting and its effect                                                                                          | Astryx setting the viewport meta, or the setting missing from the docs                                                                                                                           |
| FR2–FR5  | Recommended `spec:AST-009` follow-up: physical devices in a top-level document               | iPhone Safari with the toolbar expanded and collapsed; iPhone home-screen app; Android Chrome with `interactive-widget=resizes-content` | The page lurches, the field ends under the keyboard, or the surface does not follow the keyboard                                                                                                 |

## Decision log

### DEC-1 — One shared keyboard module, measured so a pan cannot corrupt it

**Reference:** `spec:AST-099/DEC-1`
**Decider:** `cixzhang`, `2026-10-24`

BottomSheet's keyboard hook already keeps a fixed surface still on every focus
route and measures the keyboard so a page pan cannot shrink it, which are the
two failures that leave a field under the keyboard. Making it the one module
every keyboard-aware surface uses keeps components from drifting into
separate measurements. Applying the hook's height through StyleX functional
styles keeps layout correct with no animation and keeps the shared API
constrained: the height stays internal to Core, and an app that later needs it
gets a deliberate public-API decision rather than a variable it came to rely on.
Animation stays optional polish on top.

Rejected: each component measuring the keyboard and predicting its motion on its own, which pans with any unclaimed focus route and diverges; a public CSS custom property for the height, which a hook-derived value does not need.

## Open questions

- **OQ1 — Do physical-device passes gate merge?** (`human-design`) Today they
  are recommended `spec:AST-009` follow-up evidence and DOM and visual-viewport
  tests gate. Options: keep them non-gating, as `spec:AST-009` provides; or
  make an iPhone and an Android pass in a top-level document a merge
  requirement for this record's implementation.
