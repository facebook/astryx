---
'@astryxdesign/core': patch
---

[fix] `Switch`'s focus ring now follows the switch's own input through a sibling selector instead of a `:has()` check on the whole row, so a large page no longer restyles everything under each switch whenever anything on the page changes. The ring looks and behaves the same. One edge changes: a focusable link inside the switch's label or description keeps its own focus ring and no longer also rings the switch.

@cixzhang
