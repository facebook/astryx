---
'@astryxdesign/core': patch
---

[fix] RTL Phase 4c — make three animated/interactive behaviors direction-aware under RTL: the ProgressBar indeterminate bar now slides along the reading flow (right → left) instead of always physically left → right; the Switch thumb mirrors on toggle (off-thumb on the reading-start side, on-thumb on the reading-end side, per Material/iOS convention); and horizontal Layer enter animations (Popover/DropdownMenu/HoverCard/Selector placement start/end) now nudge in from the correct physical side. Vertical Layer entrances are unchanged (direction-neutral). LTR behavior is identical.
@nynexman4464
