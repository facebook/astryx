---
'@astryxdesign/core': patch
---

[fix] `useTableGroupedRows` kept its collapse chevron pinned only when the group header used the built-in heading. The shrink-wrap that makes the sticky header work was gated behind `!renderGroupHeader`, on the reasoning that a custom heading may want the full column width — but a sticky box is confined to its containing block, so a wrapper already spanning the cell (and the cell spans every column) has no slack to take up and never moves. Any table combining `renderGroupHeader` with `useTableStickyColumns` therefore lost its collapse toggle off-screen as soon as it was scrolled sideways, with no way for userland to reach the control and pin it. The wrapper is now shrink-wrapped unconditionally.

The same chevron also grows from 12px to 16px. It is the control for an entire section and sits beside a heading, so at 12 it read as decoration on the label rather than as the thing you press, and it was the smallest hit target in the table. Row height is unchanged: the heading's line box is taller than either size, so the row was never measuring the chevron.
@ernestt
