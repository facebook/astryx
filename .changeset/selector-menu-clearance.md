---
'@astryxdesign/core': patch
---

[fix] Selector's menu now clears the trigger by the standard `--spacing-1` gap whenever it is not overlaying it — every explicit `placement`, and search mode. It was the only anchored menu in the system sitting flush against its anchor; DropdownMenu, MultiSelector, ComplexSelector, Popover, and Tooltip all use this clearance. The default selected-item overlay is unchanged: it owns its block geometry and is meant to sit on the trigger.

@cixzhang
