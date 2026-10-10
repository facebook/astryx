---
'@astryxdesign/core': patch
---

[fix] Stepper: a Stepper inside a layer opened from a step no longer picks up the outer Stepper's `--step-connector-gap`. Layer content roots (Popover and other `useLayer` surfaces, Dialog, BottomSheet, MobileNav, Lightbox, and the toast viewport) now stop that value, so the inner track starts from its `0px` default. Setting the gap on the inner Stepper or through the `stepper` theme target still works, and the gap still inherits normally outside layers.

@cixzhang
