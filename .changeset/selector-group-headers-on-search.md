---
'@astryxdesign/core': patch
---

[fix] Selector & MultiSelector: keep group headers visible while searching; hide groups with no matching items. Previously, typing a query flattened grouped options into a single ungrouped list; now each group header stays above its matching items and a group is hidden only when none of its items match.

@cixzhang
