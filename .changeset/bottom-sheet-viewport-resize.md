---
'@astryxdesign/core': patch
---

[fix] BottomSheet: a sheet resting at a detent now follows the viewport. Its detents were resolved to pixels at gesture time and never revisited, so rotating the device or resizing the window left the sheet frozen at the old geometry — a half-height sheet covering three quarters of a shorter window, and a peek detent whose slide-down could exceed the new viewport entirely, leaving a modal dialog on screen with no sheet in it. Snap fractions are also read from the layout viewport now, so the mobile keyboard no longer moves the detents out from under the sheet it is measuring (#5159).

@imdreamrunner
