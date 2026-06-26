---
'@astryxdesign/core': patch
---

[fix] ToggleButton: pass the click event to `onPressedChange` so `event.preventDefault()` opts out of `pressedChangeAction`. The async toggle now runs through Button's `clickAction`.
@cixzhang
