---
'@astryxdesign/core': patch
---

[fix] `useTableGroupedRows` kept its collapse chevron pinned only when the group header used the built-in heading. The shrink-wrap that makes the sticky header work was gated behind `!renderGroupHeader`, on the reasoning that a custom heading may want the full column width — but a sticky box is confined to its containing block, so a wrapper already spanning the cell (and the cell spans every column) has no slack to take up and never moves. Any table combining `renderGroupHeader` with `useTableStickyColumns` therefore lost its collapse toggle off-screen as soon as it was scrolled sideways, with no way for userland to reach the control and pin it. The wrapper is now shrink-wrapped unconditionally.
@ernestt
