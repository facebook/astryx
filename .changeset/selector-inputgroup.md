---
'@astryxdesign/core': patch
---

[feat] Selector composes inside InputGroup (#3520)

Selector now consumes InputGroupContext like the other single-line controls: when grouped it drops its own Field chrome, applies the shared group border/radius styling, keeps its chevron instead of the local status icon (the status message is announced via a hidden live region), and composes the group label/description/status with the trigger's ARIA via the shared helper. The listbox popover and disabled-reason tooltip work unchanged in both modes.
@arham766
