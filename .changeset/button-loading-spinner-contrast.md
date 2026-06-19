---
'@xds/core': patch
---

`XDSButton` + `XDSSpinner`: fix poor loading-spinner contrast on themed variants (#2717). The button hardcoded the destructive/primary spinner to `shade="onMedia"` (white), which disappeared on themes that render destructive as a muted light-red fill (e.g. the neutral theme). It also hid the loading label by setting `color: transparent` on the button itself, which themed `color` overrides defeated — leaking the label through on destructive.

`XDSSpinner` gains a `shade="inherit"` option that paints the ring from the inherited `currentColor` (with a translucent track), so it always matches the parent's resolved foreground regardless of theme or variant. `XDSButton` now uses `shade="inherit"` for all variants and hides its content via the content wrapper (not the button), so the spinner overlay inherits the true variant foreground while the label hides correctly.
