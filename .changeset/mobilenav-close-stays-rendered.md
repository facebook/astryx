---
'@astryxdesign/core': patch
---

[fix] MobileNav: keep the drawer rendered until the native dialog has actually closed (#4290)

`display` was driven by the `isOpen` prop, which flips during the commit, while `dialog.close()` only ran afterwards from an effect — so every close called `close()` on a dialog that was already `display: none` but still open and still in the top layer, and an open modal dialog blocks the whole document whether or not it is rendered. Safari 26.1 never un-blocked it, leaving the page inert with no JavaScript error. `display` now takes part in the transition with `transition-behavior: allow-discrete`, including when React's `<Activity mode="hidden">` hides the drawer inside AppShell, and the unmount close moves into its own effect so the deferred close is no longer cut off by its own cleanup. The close delay is derived from the hold in effect rather than assumed, because that hold is `--duration-medium` — a theme value, which the shipped y2k theme sets to exactly the 250ms the delay used to hard-code.

@AKnassa
