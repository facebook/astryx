---
'@astryxdesign/core': patch
---

[feat] Under `reset.css`, `button`, `input` and `textarea` now inherit `letter-spacing` from their parent, as they already inherit its font and color. The browser's stylesheet sets `letter-spacing: normal` on them, and `letter-spacing` is not part of `font`, so their text kept the default spacing inside tracked text. They now show that tracking. A `select` keeps the browser's spacing, because Firefox does not widen a select for letter-spacing and would clip a tracked label. Astryx's components look the same: none sets letter-spacing on a container of native controls.

To keep the old spacing, add `@layer reset { button, input, textarea { letter-spacing: normal; } }`. In the `reset` layer, it still yields to spacing a theme or your own styles set on a control.

@vjeux
