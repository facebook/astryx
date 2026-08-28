---
'@astryxdesign/core': patch
---

[fix] Text, Heading: a truncated label shows one tooltip, not two.

When `maxLines` clipped the text, both components rendered Astryx's `Tooltip`
**and** set the native `title` attribute to the same string. Hovering drew
both: the styled tooltip first, then the browser's own unstyled one on top of
it a moment later, saying exactly the same thing.

The `title` goes. `Tooltip` already wires `aria-describedby` onto the anchor,
and the full text is in the DOM either way — CSS clips it visually, so a
screen reader was never reading the truncated version. Nothing is lost but the
duplicate.

Measured on hover, same story, before and after: `2` tooltips shown to the
user, then `1`.

@freddymeta
