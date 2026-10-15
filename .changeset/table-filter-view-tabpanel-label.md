---
'@astryxdesign/cli': patch
---

[fix] The `table-filter` page template's phone-width view-options panel is now labelled by its selected tab (`aria-labelledby`) instead of a fixed `aria-label`, so screen readers get the panel's name from the tab that controls it and the tab–panel relationship resolves in both directions.

@cixzhang
