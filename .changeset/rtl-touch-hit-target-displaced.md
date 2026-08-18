---
'@astryxdesign/core': patch
---

[fix] `CheckboxInput`, `RadioListItem`, and `Switch` no longer displace their coarse-pointer (touch) hit target away from the visible control under RTL. The invisible native input is centered with a logical `insetInlineStart: 50%` paired with a physical `translate(-50%, -50%)`; under RTL the logical inset resolves from the opposite edge while the transform stays physical, so the two no longer canceled out and the actual tap target moved a full control-width away from what's visible. The transform now flips its X direction under RTL, matching the pattern `Slider`'s thumb already uses for the same class of problem.

@HelloOjasMutreja
