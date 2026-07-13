---
'@astryxdesign/core': patch
---

[fix] SegmentedControlItem now forwards a consumer onClick, and add composeEventHandlers

A consumer `onClick` on `SegmentedControlItem` was silently dropped — the internal selection handler clobbered it. It now runs alongside selection (call `preventDefault()` to opt out). The new `composeEventHandlers` utility chains handlers in order and stops when one prevents default, so components that own an interaction can also honor a consumer handler for the same event.
@cixzhang
