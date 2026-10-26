# On-screen keyboard

Core's one source for the on-screen keyboard (`spec:AST-099`,
`architecture:react-component-runtime` INV11). Everything here is internal to
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
  keyboard. BottomSheet's obstruction reads it too.
- **Where it measures (FR6, FR7, DEC-4):** `isKeyboardMeasurable(window)` is
  true for a top-level document with a visual viewport, a browser with its own
  keyboard geometry API (`navigator.virtualKeyboard`, Chrome on Android)
  included, whose visual viewport shrinks for the keyboard as everywhere
  else. It is decided from capabilities, never from the user agent or the
  pointer. A desktop browser's visual viewport never shrinks for a keyboard,
  so it reads 0; inside an iframe the height is 0. Where the app sets
  `interactive-widget=resizes-content`, Chrome shrinks the layout viewport
  with the keyboard, so the height is 0 there too: the browser has made the
  room (FR8).
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
  again.
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
  BottomSheet's hook watches while its sheet is presented.
- **BottomSheet's hook (FR4, FR5):** `useSheetKeyboard(options)` gives a
  fully expanded Tall sheet its keyboard scroll range, claims focus moves into
  it, puts back a document scroll while the page is locked, and dismisses the
  keyboard when the sheet starts to move. It returns the room the keyboard
  takes at the end of the sheet's body, which the sheet lays out through a
  functional style on its own body (FR3), committed before the reveal scrolls
  into it.

## Laying out from the height

Layout follows the height (FR3): apply it on your own element through a
functional style, so the layout is right with no animation running. For an
element docked at the bottom, rise by the part of the keyboard over its
resting bottom, and only while a keyboard is up:
`lift = height > 0 ? max(0, restingBottom − (innerHeight − height)) : 0`.

```ts
const height = useKeyboardHeight();
<div {...stylex.props(styles.dock(liftFor(height)))} />
```

## What the page sees

- Safari reveals a focused field by scrolling the whole page, so a layout that
  keeps its own content above the keyboard focuses its field with
  `preventScroll` (`refuseFocusReveal`).
- Firefox for Android reports the keyboard once it is up, and 34 to 104 ms
  later pans the visual viewport to a focused field the keyboard still
  covers. So BottomSheet reveals in the report's own event, and where a
  browser has panned to the field after a report (`watchRevealPan`), it
  lands the field with its own scroller, leaving a smooth reveal under way to
  land it, and only then scrolls the dialog's top back into view; a field it
  cannot bring up keeps the browser's reveal. Every later reveal lands at
  once in the report's frame. A browser that never pans keeps the smooth
  reveal.
- Chrome 124 on Android (Gboard) animates its own pan to a focused field the
  keyboard still covers, about 150 ms after the report, by the keyboard's
  whole height; `watchRevealPan` puts such a pan back. A Tall BottomSheet
  lands its field above the keyboard in the report's own event, so Chrome 124
  never pans it. Chromium 158 does not pan.

- Chrome on Android (Chromium 158 with Gboard, Android 15) is measured from
  its visual viewport like every browser (`spec:AST-099` DEC-4).
  `navigator.virtualKeyboard` with `overlaysContent`, the keyboard's own
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
  focused field in the keyboard report's own event.

## Files

| File                | What it holds                                                                         |
| ------------------- | ------------------------------------------------------------------------------------- |
| `keyboardHeight.ts` | The keyboard module: the height, its listeners, the focus routes, BottomSheet's hook. |
| `index.ts`          | Entry point.                                                                          |
