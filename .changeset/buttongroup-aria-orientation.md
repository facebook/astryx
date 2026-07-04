---
'@astryxdesign/core': patch
---

[fix] ButtonGroup: remove the invalid `aria-orientation` attribute from the `role="group"` element, which was flagged by axe (aria-allowed-attr). Orientation is still reflected via `data-orientation` and drives keyboard navigation and styling, so behavior is unchanged. Also fixes Schedule, which reuses ButtonGroup internally.

@cixzhang
