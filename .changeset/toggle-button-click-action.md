---
'@astryxdesign/core': patch
---

[fix] Keep ToggleButton callbacks synchronous and run pressed Actions through Button’s clickAction pathway, preserving callback cancellation and optimistic pending feedback. Omit the Action pathway for callback-only toggles and value-identified ToggleButtonGroup members, whose selection remains group-owned. (#6463)

@cixzhang
