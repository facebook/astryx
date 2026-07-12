---
'@astryxdesign/core': patch
---

[feat] AspectRatio: add a `fit` prop (`'cover' | 'contain' | 'center'`) so the component sizes and positions its child instead of every consumer hand-writing `width`/`height`/`objectFit` on the child. `cover`/`contain` ship as zero-specificity baseline rules in `reset.css` keyed on the reflected `data-fit` attribute (the same mechanism as the `data-astryx-media` baseline), so a child's own styles always win and self-sized children are unchanged; `center` centers the child at its natural size from the component's wrapper. When `fit` is omitted the child is left unstyled, preserving the existing contract (#2753)
@jiunshinn
