---
'@astryxdesign/core': patch
---

[docs] AspectRatio: document the sizing contract and add the missing anatomy. The box takes its width from its container and derives its height from the ratio, so constraining only the height clamps it off ratio (pass `width: 'auto'` alongside) and a shrink-to-fit parent collapses it to zero width. Both are now in the component JSDoc and in `bestPractices`, along with the single-child expectation: with `fit` set, every direct child is stretched to fill the box. The image-gallery example block now uses `var(--radius-element)` instead of a raw `8`.

@cixzhang
