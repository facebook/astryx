---
'@astryxdesign/core': patch
---

[fix] Add a shared `rtlStyles.centerInline(blockOffset)` helper for horizontally centering an absolutely-positioned, auto-width element on the inline axis, with an optional block-axis offset folded into the same transform. It intentionally uses physical `left: 50%` + `translateX(-50%)` — both reference the same physical edge, so the pair is direction-symmetric and centers identically in LTR and RTL. A logical `insetInlineStart: 50%` anchor would flip in RTL while the physical translate does not, shifting the element off-center by its own width. This is the one case where physical `left` is correct, so the single sanctioned `no-physical-properties` suppression lives in the helper rather than at each call site.

The `@astryx/no-physical-properties` rule now recognises this `left: '50%'` + centering `translate` idiom and points offenders at the helper instead of wrongly suggesting a logical rename.
@nynexman4464
