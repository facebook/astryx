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
  again.
- **BottomSheet's hook (FR4, FR5):** `useMobileKeyboard(options)` gives a
  fully expanded Tall sheet its keyboard scroll range, claims focus moves into
  it, puts back a document scroll while the page is locked, and dismisses the
  keyboard when the sheet starts to move.

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
  animator.animate(
    {y: layoutLift - lift(t.to)},
    {spring: springs.keyboard},
    {at: t.start},
  );
});
```

Each transition is `{kind, from, to, start, velocity, animated, predicted}`:
heights in CSS px, `start` on the document timeline (in the past for a show
Safari reported late, slightly ahead for a hide that starts after a blur).
Move your own elements on the compositor with the animator, from `start`, on
`springs.keyboard`, and hand the translate back to the layout once the ride
ends (ChatLayout does). Under Reduce Motion nothing travels with the keyboard
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

## Consumers

- BottomSheet (`BottomSheet/BottomSheetPanel.tsx`): `useMobileKeyboard`.
- ChatLayout (`Chat/useChatKeyboard.ts`): the dock and the spacer after the
  messages are laid out from `useKeyboardHeight`; the guide's ride moves the
  dock, and a transcript at its newest message, with the keyboard; a tap on the
  composer's text focuses it without Safari's reveal.

## Files

| File                     | What it holds                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `useMobileKeyboard.ts`   | The keyboard module: the height, its listeners, the focus refusal, BottomSheet's hook.     |
| `keyboardModel.ts`       | The clock-free core of the guide: transitions from keyboard reports and focus changes.     |
| `keyboardLayoutGuide.ts` | One guide per window, fed by the keyboard module: the frame watch, the verification timer. |
| `index.ts`               | Entry point.                                                                               |

The timing constants live in `../motion/uikit/keyboard.ts`, the spring in
`springs.keyboard`, the duration in `timing.keyboardNotificationMs`.
