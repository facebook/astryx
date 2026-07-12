---
'@astryxdesign/core': patch
---

[feat] AspectRatio: add a `fit` prop (`'cover' | 'contain' | 'center'`) so the component sizes and positions its child instead of every consumer hand-writing `width`/`height`/`objectFit` on the child. `cover`/`contain` ship as zero-specificity baseline rules in `reset.css` keyed on a `data-astryx-aspect-ratio-override` marker the component sets on the child's direct parent (direct-child selectors, no dependence on internal structure or the theming surface), so a child's own styles always win and self-sized children are unchanged; `center` centers the child at its natural size from the component's wrapper. When `fit` is omitted the child is left unstyled, preserving the existing contract (#2753)
@jiunshinn
