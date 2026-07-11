---
'@astryxdesign/core': patch
---

[fix] useFocusTrap: focus now returns to the previously-focused element when a trap deactivates, so closing a Popover (Escape or light-dismiss) no longer drops keyboard focus to the page body. Components that already restore focus themselves are unaffected — the trap only restores when focus would otherwise be lost. (#3732)
@bhamodi
