---
'@astryxdesign/core': patch
---

[fix] MobileNav: keep the drawer rendered until the native dialog has actually closed (#4290)

`display` was driven entirely by the `isOpen` prop, which flips during the commit, while `dialog.close()` only ran afterwards from an effect. Every close therefore called `close()` on a dialog that was already `display: none` but still open and still in the top layer — and an open modal dialog blocks the whole document whether or not it is rendered. Browsers that do not un-block the document when such a dialog closes leave the page inert with no JavaScript error, which is what Safari 26.1 did.

`display` now takes part in the transition with `transition-behavior: allow-discrete`, so it flips to `none` only once the slide-out has finished — including when React's `<Activity mode="hidden">` hides the drawer inside AppShell, where the hide is applied as an inline `!important` style. The unmount close also moves into its own effect, matching `lab/Drawer`: keeping it in the open/close effect meant its cleanup closed the dialog on every `isOpen` flip and cut off the delayed close, so the slide-out never played.

The close delay is derived from the hold actually in effect rather than assumed. That hold is `--duration-medium`, which themes rewrite — the shipped y2k theme sets it to exactly 250ms, as does the documented "Snappy" motion preset — so a fixed 250ms delay sat on the hold's boundary, and any shorter theme landed past it. `prefers-reduced-motion` now shortens the delay instead of the hold: shrinking both left no slack, so one slow frame between the commit and the close reproduced the original fault on the accessibility setting.

@AKnassa
