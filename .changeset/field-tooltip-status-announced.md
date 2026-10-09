---
'@astryxdesign/core': patch
---

[fix] A field status shown with `statusVariant="tooltip"` is now announced to screen readers when it appears or changes, the same way the attached and detached message boxes are: errors assertively, warnings and successes politely.

Before, the tooltip placement only described the control, so a screen-reader user was not told that a validation message had appeared until they left and re-entered the field. This affects every input that offers the tooltip placement. The attached and detached placements are unchanged and are still announced once.

@cixzhang
