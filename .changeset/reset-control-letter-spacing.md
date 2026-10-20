---
'@astryxdesign/core': patch
---

[feat] Under `reset.css`, form controls (`button`, `input`, `optgroup`, `select`, `textarea`) now inherit `letter-spacing` from their parent, as they already inherit its font and color. The browser's stylesheet sets `letter-spacing: normal` on them, and `letter-spacing` is not part of `font`, so a control's text kept the default spacing inside tracked text. Controls inside a container with letter-spacing now show that tracking. Astryx's components look the same: none sets letter-spacing on a container of native controls.

To keep the old spacing, add `@layer reset { button, input, optgroup, select, textarea { letter-spacing: normal; } }`. In the `reset` layer, it still yields to spacing a theme or your own styles set on a control.

@vjeux
