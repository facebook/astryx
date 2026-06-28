---
'@astryxdesign/core': patch
---

[fix] ToggleButton onPressedChange receives the click event for preventDefault opt-out
@cixzhang

`onPressedChange` now receives the originating click event as a second
argument. Calling `event.preventDefault()` skips `pressedChangeAction`, so a
consumer can handle the toggle entirely in `onPressedChange` without firing the
action — matching how `Switch`'s `onChange` and `Button`'s `onClick` already
gate their action props. Existing `(isPressed) => void` handlers keep working;
the event is an added trailing argument.
