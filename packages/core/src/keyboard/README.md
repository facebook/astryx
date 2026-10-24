# Keyboard layout guide

The web's `UIKeyboardLayoutGuide`: where the software keyboard covers the
layout viewport, and when and how it moves, so touch presentations can keep
content above it. It is internal to `@astryxdesign/core`: components import it
from `../keyboard`, and nothing here is exported from the package entry.

## Using it from a component

```ts
const guide = getKeyboardLayoutGuide(window);
const unsubscribe = guide.subscribe(t => {
  animator.animate(
    {y: -lift(t.to)},
    {spring: springs.keyboard},
    {at: t.start, reducedMotion: 'keep'},
  );
});
```

Each transition is `{kind, from, to, start, velocity, animated, predicted}`:
insets in CSS px, `start` on the document timeline (in the past for a show
Safari reported late, slightly ahead for a hide that starts after a blur).
Move your own elements on the compositor with the animator, from `start`, on
`springs.keyboard`. Content that follows the keyboard mirrors it, and Reduce
Motion leaves the iOS keyboard's motion as it is, so keep the motion
(`reducedMotion: 'keep'`). `presentation(time)` gives the inset at any time,
for something that appears while the keyboard moves.

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

## Consumers

- ChatLayout (`Chat/useChatKeyboard.ts`): the dock rides the keyboard, the
  transcript keeps room to scroll above it and stays at its newest message,
  and a tap on the composer's text focuses it without Safari's reveal.

## Files

| File                     | What it holds                                                                 |
| ------------------------ | ----------------------------------------------------------------------------- |
| `keyboardModel.ts`       | The clock-free core: transitions from viewport reports and focus changes.     |
| `keyboardLayoutGuide.ts` | One guide per window: the listeners, the frame watch, the verification timer. |
| `index.ts`               | Entry point.                                                                  |

The timing constants live in `../motion/uikit/keyboard.ts`, the spring in
`springs.keyboard`, the duration in `timing.keyboardNotificationMs`.
