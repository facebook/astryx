# On-screen keyboard

Core's one source for the on-screen keyboard (`spec:AST-099`,
`architecture:react-component-runtime` INV11), and the keyboard layout guide
that times motion with it. Everything here is internal to
`@astryxdesign/core`: components import it from `../keyboard`, and nothing is
exported from the package entry.

## The keyboard module (`useMobileKeyboard.ts`)

- **The height (FR2):** `measureKeyboardHeight(window)` is the layout
  viewport's height minus the visual viewport's height times its scale, in CSS
  px. A page pan is not a smaller keyboard, and a pinch zoom is not a keyboard.
- **Where it measures (FR6, FR7):** `isKeyboardMeasurable(window)` is true for
  a top-level document with a visual viewport and no keyboard geometry API of
  its own. It is decided from capabilities, never from the user agent.
  Elsewhere the height is 0: Chrome's `navigator.virtualKeyboard` (Android's
  path, where the app's `interactive-widget=resizes-content` resizes the
  layout itself, FR8), and inside an iframe.
- **One set of listeners (FR1, INV11):** `subscribeMobileKeyboard(window, fn)`
  delivers every report (the visual viewport's resize and scroll, the window's
  resize, focus moves) from one set of listeners per window, however many
  components subscribe. `useKeyboardHeight()` gives a component the height and
  re-renders it when the height changes. No other code in core listens to the
  visual viewport for the keyboard.
- **Focus (FR4):** `refuseFocusReveal(document, {claim, park, isActive})`
  delivers every focus move a surface claims with `preventScroll`, on the
  capture-phase `blur` before the browser's own focus step, so the browser
  never reveals a field by scrolling the document. Focus that leaves for
  nothing (the keyboard's Done) can be parked so the next tap is a transition
  again. A tap on a field when nothing has focus raises no blur:
  `claimTapFocus(region, {claim, deliver})` is that route. It follows one
  finger with listeners on the region, only while the touch is down, and on a
  tap (within 10 px) prevents the touch's default and delivers the focus
  itself (ChatLayout puts the caret where the finger lifted). Safari still
  sends a held tap's mousedown and click, aimed at whatever is under the
  finger by then, so the route swallows them on the document until the tap's
  click or the next touch, pointer press or key.
- **BottomSheet's hook (FR4, FR5):** `useMobileKeyboard(options)` gives a
  fully expanded Tall sheet its keyboard scroll range, claims focus moves into
  it, puts back a document scroll while the page is locked, and dismisses the
  keyboard when the sheet starts to move. It returns the room the keyboard
  takes at the end of the sheet's body, which the sheet lays out through a
  functional style on its own body (FR3), committed before the reveal scrolls
  into it.

## Laying out from the height, riding on top

Layout follows the height (FR3): apply it on your own element through a
functional style, so the layout is right with no animation running. For an
element docked at the bottom, rise by the part of the keyboard over its
resting bottom, and only while a keyboard is up:
`lift = height > 0 ? max(0, restingBottom − (innerHeight − height)) : 0`.

```ts
const height = useKeyboardHeight();
<div {...stylex.props(styles.dock(liftFor(height)))} />
```

An animation that rides the keyboard is optional polish on top, timed by the
guide:

```ts
const guide = getKeyboardLayoutGuide(window);
const unsubscribe = guide.subscribe(t => {
  rideKeyboard(animator, {y: layoutLift - lift(t.to)}, t);
});
```

Each transition is `{kind, from, to, start, velocity, animated, predicted,
curve}`: heights in CSS px, `start` on the document timeline (in the past for
a show reported after the keyboard started, slightly ahead for a hide that
starts after a blur), and `curve` Gboard's slide in Chrome on Android (null
for UIKit's spring). `rideKeyboard` moves your element on the compositor from
`start` on the keyboard's own motion: `keyboard.spring` on iOS, the Android
table's show or hide curve (`../motion/android/keyboard.ts`) in Chrome, values
no theme retunes, or at once when the transition is not animated. Hand the
translate back to the layout once the ride ends (ChatLayout does). Under Reduce Motion nothing travels with the keyboard
(design:reduced-motion): the animator's default cross-fades on a touch screen
and moves at once otherwise. `presentation(time)` gives the height presented
at any time, for something that appears while the keyboard moves.

## What the page sees (Mobile Safari, iOS 26.2)

- Show: one `resize` of the visual viewport, with the final height, about
  `keyboard.showReportLagMs` after the keyboard started to rise. A busy main
  thread holds the report back, but UIKit raises the keyboard on its own
  schedule, `keyboard.focusToShowMs` after the focus: the guide watches frames
  from the focus and dates a report that follows a gap from the focus (no
  earlier than the last frame before the report), however late, so the dock
  joins the spring where the keyboard is by then. Without a focus it goes
  back to the last frame before the report, at most
  `keyboard.showReportLagMaxMs`.
- Hide: the `resize` comes only once the keyboard is down. The keyboard starts
  to fall `keyboard.hideAfterBlurMs` after the focused control blurs to
  something that brings up no keyboard, whether the page blurred it or the
  accessory bar's Done did, so the guide starts the hide at the blur and takes
  the late `resize` as its confirmation. A prediction the viewport has not
  confirmed once it should have ended gives way to what the viewport says.
- Another keyboard while one is up (a field that brings up the number pad)
  is UIKit's zero-duration change: the height jumps.
- Safari reveals a focused field by scrolling the whole page, so a layout that
  keeps its own content above the keyboard focuses its field with
  `preventScroll` (a claimed tap, or `refuseFocusReveal`).

## What the page sees (Chromium 158 with Gboard, Android 15)

Measured frame by frame on the emulator, with a marker the page paints on each
report and Gboard's top read from every recorded frame (`../motion/android/
keyboard.ts` has the numbers and their sources). The guide reads these reports
in a browser with the VirtualKeyboard API (`keyboardProfileOf`), and the
keyboard module measures them from the visual viewport under a finger (FR8,
proposed; pending owner review on #8304).

- Show: Gboard slides up over the page in about 267 ms. Chrome's one `resize`
  of the visual viewport comes just after the slide starts: its first painted
  frame trails Gboard's first moved frame by 14 to 35 ms. The guide dates the
  show back by `androidKeyboard.showReportLagMs` and rides Gboard's show
  curve, joining the slide where it is, so the composer stays on top of the
  keyboard instead of being covered until the report.
- Hide: Gboard starts down about `androidKeyboard.hideAfterBlurMs` after the
  blur and leaves in about 167 ms; the `resize` comes mid-slide. The guide
  starts the hide at the blur and takes the `resize` as its confirmation; a
  hide nothing predicted (Back, which keeps the focus) rides from its report,
  dated back `hideReportLagMs`.
- When focus moves from one field to another through something that brings up
  no keyboard (a popover's container), Chrome reports the keyboard gone and
  back within about 50 ms. A hide reported while a field that gained focus less
  than 150 ms ago still has it waits for the move to settle.
- `navigator.virtualKeyboard` with `overlaysContent`, the keyboard's own
  geometry, was measured and not used: in 12 shows its `geometrychange` was
  painted 0 to 67 ms after Gboard started (against 14 to 35 ms for the
  visual viewport), it failed to show the keyboard in 4 of 12 shows when set
  on focus (1 of 24 when set as the touch lands), and it hides Chromium's bottom
  toolbar on the keyboard's frame (+56 px of layout).

## Consumers

- BottomSheet (`BottomSheet/BottomSheetPanel.tsx`): `useMobileKeyboard`, whose
  inset the body's `keyboardInset` functional style lays out.
- ChatLayout (`Chat/useChatKeyboard.ts`): the dock and the spacer after the
  messages are laid out from `useKeyboardHeight`; the guide's ride moves the
  dock, and a transcript at its newest message, with the keyboard; a tap on the
  composer's text focuses it without Safari's reveal.

## Files

| File                     | What it holds                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `useMobileKeyboard.ts`   | The keyboard module: the height, its listeners, the focus routes, BottomSheet's hook.                         |
| `keyboardModel.ts`       | The clock-free core of the guide: transitions from keyboard reports and focus changes.                        |
| `keyboardLayoutGuide.ts` | One guide per window, fed by the keyboard module: the frame watch, the verification timer, the focus handoff. |
| `rideKeyboard.ts`        | Moves an element with the keyboard on its spring (iOS) or Gboard's slide (Chrome), or at once.                |
| `index.ts`               | Entry point.                                                                                                  |

The timing constants live in `../motion/uikit/keyboard.ts` (iOS) and
`../motion/android/keyboard.ts` (Chrome with Gboard), the spring in
`keyboard.spring`, the duration in `timing.keyboardNotificationMs`.
