# Keyboard layout guide

The web's `UIKeyboardLayoutGuide`: where the software keyboard covers the
layout viewport, and when and how it moves, so touch presentations can keep
content above it. Core components import it from `../keyboard`. Lab
components import `getKeyboardLayoutGuide`, `useKeyboardLayoutGuide` and the
`KeyboardLayoutGuide` / `KeyboardTransition` types from the experimental
subpath `@astryxdesign/core/keyboard/experimental` (spec:AST-017 FR21: outside
the stable promise, never re-exported from the package root).

## Using it from a component

```ts
const guide = getKeyboardLayoutGuide(window);
const unsubscribe = guide.subscribe(t => {
  rideKeyboard(animator, {y: -lift(t.to)}, t);
});
// A field that keeps itself above the keyboard:
const unregister = guide.overlayWhileFocused(field);
```

In React, `useKeyboardLayoutGuide(onTransition, {overlayFor: fieldRef})`
(the experimental subpath) does both while the component is mounted.

Each transition is `{kind, from, to, start, velocity, animated, predicted,
curve}`: insets in CSS px, `start` on the document timeline (in the past for a
show Safari reported late, slightly ahead for a hide that starts after a
blur), and `curve` the eased slide on Chrome (null for UIKit's spring).
`rideKeyboard` moves your element on the compositor from `start` on the
keyboard's own motion: `springs.keyboard` on iOS, the Android table's curve
(`motion/android/keyboard.ts`) on Chrome, both theme roles. Content that
follows the keyboard mirrors it, and Reduce Motion leaves the keyboard's
motion as it is, so the motion stays (`reducedMotion: 'keep'`).
`presentation(time)` gives the inset at any time, for something that appears
while the keyboard moves.

`overlayWhileFocused(element)` is for a field that moves itself above the
keyboard. While focus is in it, the guide sets
`navigator.virtualKeyboard.overlaysContent` (Chrome; Safari has no such API),
so Chrome neither resizes nor pans the page for the keyboard. It sets the
flag at the touch on the field or the focus it gets, and only if the page had
not set it. It restores only what it set (and only if it is still set) when
focus leaves every registered field, when the field unregisters, and on
`pagehide`.

For an element docked at the bottom, rise by the part of the cover over its
resting bottom, and only while a keyboard is up:
`lift = to > 0 ? max(0, restingBottom − (innerHeight − to)) : 0`.

## What the page sees (Mobile Safari, iOS 26.2)

- The inset is `innerHeight − (visualViewport.offsetTop + visualViewport.height)`:
  the keyboard, its accessory bar and Safari's floating address bar. When
  Safari pans the page to reveal a field, the visual viewport moves down the
  layout viewport and the inset shrinks by as much. Pinch-zoomed, it is
  unknown and the guide holds.
- Show: one `resize` of the visual viewport, with the final height, about
  `keyboard.showReportLagMs` after the keyboard started to rise. A busy main
  thread holds the report back; the keyboard then started at about the last
  frame the page rendered before it, so the guide watches frames from the
  focus and dates the show back to that frame (never further than
  `keyboard.showReportLagMaxMs`).
- Hide: the `resize` comes only once the keyboard is down. The keyboard starts
  to fall `keyboard.hideAfterBlurMs` after the focused control blurs to
  something that brings up no keyboard, whether the page blurred it or the
  accessory bar's Done did, so the guide starts the hide at the blur and takes
  the late `resize` as its confirmation. A prediction the viewport has not
  confirmed once it should have ended gives way to what the viewport says.
- Another keyboard while one is up (a field that brings up the number pad)
  is UIKit's zero-duration change: the inset jumps.
- Safari reveals a focused field by scrolling the whole page, so a layout that
  keeps its own content above the keyboard focuses its field with
  `preventScroll` from a claimed tap (ChatLayout's composer does).

## What the page sees (Chrome 124 with Gboard, Android 15)

- By default (`resizes-visual`) the visual viewport changes in steps, each at
  the start of the keyboard's slide: an `<input>` brings Chrome's accessory
  bar first (811 → 763), then the keyboard 120 ms later (→ 451); a
  contenteditable gets one step. A hide is reported as it starts. About 120
  ms after the step, Chrome pans the visual viewport over about 185 ms to
  reveal a covered field, even after `focus({preventScroll: true})`.
- While the page overlays the keyboard, nothing resizes or pans: one
  `geometrychange` at the start of the slide carries the keyboard's height
  (its `y` is wrong in Chrome 124 and is not read), and another at the start
  of the hide. Chrome also fires transient visual viewport resizes then
  (811 → 1123 → 811), which the guide ignores.
- Back hides the keyboard and keeps focus: a hide nobody predicted.
- When focus moves from one field to another through something that brings
  up no keyboard (a popover's container), Chrome reports the keyboard gone
  and back within about 50 ms (451 → 811 → 451). A hide reported while a field
  that gained focus less than 150 ms ago still has it waits for the move to
  settle.
- Gboard slides on AOSP's IME curve: show 285 ms, hide 250 ms
  (`motion/android/keyboard.ts`).

## Consumers

- ChatLayout (`Chat/useChatKeyboard.ts`): the dock rides the keyboard, the
  transcript keeps room to scroll above it and stays at its newest message,
  and a tap on the composer's text focuses it without Safari's reveal.

## Files

| File                        | What it holds                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `keyboardModel.ts`          | The clock-free core: transitions from viewport reports and focus changes.                  |
| `keyboardLayoutGuide.ts`    | One guide per window: the listeners, the frame watch, the verification timer, the overlay. |
| `rideKeyboard.ts`           | Moves an element with the keyboard on its spring (iOS) or its curve (Chrome).              |
| `useKeyboardLayoutGuide.ts` | The guide and a transition listener for a React component.                                 |
| `experimental.ts`           | The `@astryxdesign/core/keyboard/experimental` subpath.                                    |
| `index.ts`                  | Entry point.                                                                               |

The timing constants live in `../motion/uikit/keyboard.ts`, the spring in
`springs.keyboard`, the duration in `timing.keyboardNotificationMs`.
