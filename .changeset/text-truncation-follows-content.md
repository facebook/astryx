---
'@astryxdesign/core': patch
---

[fix] A truncated `Text` or `Heading` (`maxLines`) now re-measures when its content changes, not only when its box resizes. A fixed-width single-line status whose message changed kept showing the first message in its truncation tooltip, and a new short message could keep a tooltip while a new long one lacked one. `useTruncation` now also observes the element's text, so the tooltip text and the truncated state follow the current content.

@cixzhang
