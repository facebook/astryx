---
'@astryxdesign/core': patch
---

[fix] Dialog: fullscreen safe-area padding follows writing direction and defers to explicit padding

Two corrections to the fullscreen safe-area padding that shipped in 0.5.0.

**The insets were mapped to the wrong edges in RTL.** `env(safe-area-inset-left)` and `env(safe-area-inset-right)` are physical, but they were assigned straight to `padding-inline-start` and `padding-inline-end`, which are logical. That holds in LTR and inverts in RTL, where inline-start is the right edge — so a device notch on the physical left padded the edge away from it and left the notched edge unprotected. Each physical inset now feeds the logical edge that actually faces it, in both directions.

**Safe-area protection overrode explicit padding.** The `max()` was applied to the fullscreen surface unconditionally, so it beat both a `padding` prop and a theme's `dialog: {padding: 0}`, and a deliberately full-bleed fullscreen dialog could not be expressed. It now sits in the innermost fallback of the same `--astryx-dialog-padding*` chain `container` already resolves, so it applies only when no padding is set anywhere. An explicit value, `0` included, is honored as written.

@rubyycheung
