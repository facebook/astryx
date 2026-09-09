---
'@astryxdesign/core': patch
---

[feat] `Collapsible` and `CollapsibleGroup` accept `chevronPosition="start" | "end"`. The default remains `end`, preserving the released trailing chevron. `start` moves the disclosure arrow ahead of the label for tree/file-browser-style rows: it points inward toward content when collapsed, mirrors under RTL, and turns downward when expanded.

Set the position on `CollapsibleGroup` when direct items should share it. An individual `Collapsible` may override the group, while a Collapsible nested inside an item's content starts a new presentation scope and keeps its own default.

@ernestt
