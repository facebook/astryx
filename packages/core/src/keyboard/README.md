# On-screen keyboard

Core's one source for the on-screen keyboard (`spec:AST-099`,
`architecture:react-component-runtime` INV11), and the keyboard layout guide
that times motion with it. Everything here is internal to
`@astryxdesign/core`: components import it from `../keyboard`, and nothing is
exported from the package entry.

## The keyboard module (`keyboardHeight.ts`)

- **The height (FR2):** `measureKeyboardHeight(window)` is the layout
  viewport's height minus the visual viewport's height times its scale, in CSS
  px. A page pan is not a smaller keyboard, and a pinch zoom is not a keyboard.
  The layout viewport's height is `layoutViewportHeight(window)`
  (`../utils/layoutViewport.ts`), in layout px in every engine: WebKit reports
  `innerHeight` and `innerWidth` in the zoomed visual viewport's px, which
  `innerWidth` matching the visual viewport's width tells apart. A classic
  horizontal scrollbar, which `innerHeight` counts and the visual viewport
  does not, is taken out, so a desktop page wider than its window reads no
  keyboard. BottomSheet's obstruction and ChatLayout's lift read it too.
- **Where it measures (FR6, FR7, DEC-4):** `isKeyboardMeasurable(window)` is
  true for a top-level document with a visual viewport, a browser with its own
  keyboard geometry API (`navigator.virtualKeyboard`, Chrome on Android)
  included, whose visual viewport shrinks for the keyboard as everywhere
  else. It is decided from capabilities, never from the user agent or the
  pointer. A desktop browser's visual viewport never shrinks for a keyboard,
  so it reads 0; inside an iframe the height is 0, and ChatLayout leaves its
  composer's taps and focus to the browser. Where the app sets
  `interactive-widget=resizes-content`, Chrome shrinks the layout viewport
  with the keyboard, so the height is 0 there too and nothing rides: the
  browser has made the room (FR8).
- **One set of listeners (FR1, INV11):** `subscribeKeyboardHeight(window, fn)`
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
- **The browser's own reveal pan (FR4):** `watchRevealPan(window, {owns})`
  is the one building block every keyboard-aware surface uses for a browser
  that pans the visual viewport to a focused field after the keyboard's
  report. The surface calls `report()` on each report that changes the
  height; on a later report, `isRevealPan(height)` says the visual viewport
  has moved down with no touch, document scroll or zoom since, while a text
  field the surface owns has focus, and `putBack()` pans it back without
  scrolling the document, by scrolling into view a probe fixed where the
  visual viewport sat at the report (or the element given, such as a
  full-viewport dialog). Its one listener, a passive capture-phase
  `touchstart` on the document, lives only while a surface watches.
  ChatLayout watches under a finger; BottomSheet's hook watches while its
  sheet is presented.
- **BottomSheet's hook (FR4, FR5):** `useSheetKeyboard(options)` gives a
  fully expanded Tall sheet its keyboard scroll range, claims focus moves into
  it, puts back a document scroll while the page is locked, and dismisses the
  keyboard when the sheet starts to move. It returns the room the keyboard
  takes at the end of the sheet's body, which the sheet lays out through a
  functional style on its own body (FR3), committed before the reveal scrolls
  into it. Under a coarse primary pointer, where the guide publishes the
  keyboard's own slide (Gboard's, in Chrome on Android), the sheet rides it
  (FR8): a reveal during the show
  scrolls the body at once and the content box rides up from where it was on
  the show's curve; through the hide the room stays and the content box
  rides down by the scroll the room's drop takes back, and at rest the room
  drops and the translate clears in one commit. Under a fine pointer nothing
  of the ride attaches (no guide subscription), and the room follows the
  reports. Safari's and Firefox's reveals are unchanged.

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

Each transition is
`{kind, from, to, start, velocity, animated, predicted, curve, spring}`:
heights in CSS px, `start` on the document timeline (in the past for a show
reported after the keyboard started, slightly ahead for a hide that starts
after a blur), and the curve the keyboard moves on: `curve`, Gboard's slide in
Chrome on Android, or else `spring`, UIKit's keyboard spring
(`keyboard.spring`), values and no motion role
(architecture:react-component-runtime INV11). `rideKeyboard` moves your
element on the compositor from `start` on that curve, or at once when the
transition is not animated. Hand the translate back to the layout once the
ride ends (ChatLayout does). Under Reduce Motion nothing travels with the keyboard
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
- Firefox for Android reports the keyboard once it is up, and 34 to 104 ms
  later pans the visual viewport to a focused field the keyboard still
  covers. So BottomSheet reveals in the report's own event, and where a
  browser has panned to the field after a report (`watchRevealPan`), it
  lands the field with its own scroller, leaving a smooth reveal under way to
  land it, and only then scrolls the dialog's top back into view; a field it
  cannot bring up keeps the browser's reveal. Every later reveal lands at
  once in the report's frame. A browser that never pans keeps the smooth
  reveal.
- Chrome 124 on Android (Gboard) animates its own pan to the focused
  composer about 150 ms after the report, by the keyboard's whole height,
  while the composer is still riding up; left alone, the composer ends
  mid-screen. ChatLayout puts the pan back on its first frame
  (`watchRevealPan`), so the visual viewport stays where it was and the
  composer rests on the keyboard. Chromium 158 does not pan.

## What the page sees (Chromium 158 with Gboard, Android 15)

Measured frame by frame on the emulator, with a marker the page paints on each
report and Gboard's top read from every recorded frame (`../motion/android/
keyboard.ts` has the numbers and their sources). The guide reads these reports
in a browser with the VirtualKeyboard API (`keyboardProfileOf`), and the
keyboard module measures them from the visual viewport, as in every browser
(`spec:AST-099` FR8, DEC-4).

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

- BottomSheet (`BottomSheet/BottomSheetPanel.tsx`): `useSheetKeyboard`, whose
  inset the content box's `keyboardInset` functional style lays out as the
  content's last box (after its own children, so it adds scroll range in
  Firefox too, which keeps the content box at the body's height); it reveals the
  focused field in the keyboard report's own event, and in Chrome rides the
  content box on Gboard's slides (`rideKeyboard`, from the guide's
  transitions).
- ChatLayout (`Chat/useChatKeyboard.ts`): the dock and the message area's end
  padding are laid out from `useKeyboardHeight`; under a coarse pointer the
  guide's ride moves the dock, and a transcript at its newest message, with
  the keyboard; a tap on
  the composer's text is the tap route, and every other move into it the
  focus takeover (`refuseFocusReveal`), so none scrolls the page; the
  keyboard's Done parks focus on the composer region, a named group that is
  no tab stop. The composer's own focus routes pass `preventScroll` under a
  finger in that region (`Chat/keyboardSurface.ts`).

## Files

| File                     | What it holds                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `keyboardHeight.ts`      | The keyboard module: the height, its listeners, the focus routes, BottomSheet's hook.                                 |
| `keyboardModel.ts`       | The clock-free core of the guide: transitions from keyboard reports and focus changes.                                |
| `keyboardLayoutGuide.ts` | One guide per window, fed by the keyboard module: the frame watch, the verification timer, the focus handoff.         |
| `rideKeyboard.ts`        | Moves an element with the keyboard on the curve its transition publishes, or at once (tests: `rideKeyboard.test.ts`). |
| `index.ts`               | Entry point.                                                                                                          |

The timing constants live in `../motion/uikit/keyboard.ts` (iOS) and
`../motion/android/keyboard.ts` (Chrome with Gboard), the spring in
`keyboard.spring`, the duration in `keyboardNotification` (composed into
`timing` as `keyboardNotificationMs`).
