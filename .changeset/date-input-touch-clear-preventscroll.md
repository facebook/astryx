---
'@astryxdesign/core': patch
---

[fix] DateInput: clearing on touch no longer jumps the page to the top

On the touch surface, tapping the clear (✕) threw the user to the top of the
page. Clearing unmounts the clear button, and `handleClear` focused the field
in that same task — on iOS Safari, focusing an element as the focused button is
removed scrolls the whole document to 0. The focus handoff is now deferred past
the unmount, which keeps the page where it was and still returns focus to the
field.

Measured on the iOS 26 simulator against the live docsite (DateInput —
Clearable, page at scrollY 2055): synchronous focus → 0, deferred focus → 2055.
`preventScroll` alone does not fix it; it is kept for the ordinary
scroll-into-view nudge, which is unwanted for the same reason.

@imdreamrunner
