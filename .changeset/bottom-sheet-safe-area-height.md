---
'@astryxdesign/core': patch
---

[fix] Bottom Sheet: give content room above the iOS home indicator

A named height budget now sizes the sheet's content. The device's bottom safe-area inset plus a 16px gutter are added on top of it, so a `capped` sheet shows the same amount of content on a phone with a home indicator as on one without, and content keeps breathing room above the indicator instead of ending exactly where it starts.

A no-scrim (`hasScrim={false}`) sheet no longer lets the page show through iOS Safari's translucent address bar. The sheet was positioned against the dialog's own `100dvh` height, and that length goes stale while the address bar animates between its expanded and compact states, leaving the sheet a bar's height off the bottom of the screen. It is now pinned to the viewport directly, which the compositor resolves at paint time, so it stays flush in every bar state.

@imdreamrunner
