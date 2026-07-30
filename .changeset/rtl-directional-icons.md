---
'@astryxdesign/core': patch
---

[feat] RTL: mirror directional disclosure/navigation chevrons under RTL via a shared `rtlStyles.mirror` CSS transform, applied to the icon wrapper in Lightbox and the Table tree / grouped-rows / row-expansion plugins. The mirror composes correctly with the Table chevrons' state-rotation (expanded chevrons still point down under RTL). Semantic aria-labels are unchanged.

@nynexman4464
