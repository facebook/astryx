---
'@astryxdesign/core': patch
---

[feat] DateInput: the platform's own date picker on touch, with
`nativePicker` to choose otherwise

A touch device now gets the browser/OS picker — the iOS wheel, the Android
calendar dialog — drawn by the platform, with its own hit areas, momentum
scrolling, locale and accessibility settings. `nativePicker` picks the
surface: `'touch'` (the default) uses it on a coarse pointer, `'always'`
wherever the browser supports `<input type="date">`, and `'never'` keeps
Astryx's own pickers everywhere — the bottom-sheet picker on a finger, the
calendar popover on a mouse.

Reach for `'never'` on a field that needs what a native picker cannot
express: `weekStartsOn`, `numberOfMonths`, or `dateConstraints`.

`format` and `placeholder` still apply in native mode — DateInput paints the
closed field's text itself, over the control, so a date reads the same on a
phone as on a desktop. `min` and `max` are forwarded, but a native picker may
not _show_ them: on iOS they are constraint-validation flags rather than
clamps, so an out-of-range date can be selected, and it is refused on commit
and announced rather than greyed out in the picker. Mouse-driven devices are
unaffected.

@imdreamrunner
