---
'@astryxdesign/core': patch
---

[feat] DateInput uses the platform date picker on touch, with `nativePicker` to choose the native or Astryx surface; focused desktop-style native fields reveal their editable segments, the Astryx touch sheet keeps Reset in its header and Save alone in its footer, and both closed surfaces match standard input height (#5261, #5456, #5502, #5534)

`nativePicker="touch"` is the default, `"always"` uses `<input type="date">` wherever supported, and `"never"` keeps Astryx's sheet or popover. Formatting still returns on blur, and `min`/`max` continue to validate native selections.

@imdreamrunner
