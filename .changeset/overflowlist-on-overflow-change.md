---
'@astryxdesign/core': patch
---

[feat] `OverflowList` can now hand its collapsed items to a menu you already render, via `onOverflowChange(overflowItems)`. `overflowRenderer` only describes an indicator the list mounts itself, and only while items overflow — so a row that already carries a standing "…" menu had no way to collect the collapsed items into it, and adding an indicator gave the user two menus side by side. Watching from the outside was not reachable either: a reporter component placed inside `overflowRenderer` mounts twice (the hidden measurement copy always receives _every_ item, so it cannot tell you what is actually collapsed), and nothing fires when the row widens back out and the set empties. The new callback fires with the current collapsed set whenever it changes — an empty array when everything fits — and leaves the anchor entirely to the caller. It reports after measurement from a layout effect, so the menu updates in the same frame as the collapse, and it is keyed on the collapsed range, so unrelated re-renders and inline callbacks do not re-fire it. Both may be used together; using `onOverflowChange` alone adds nothing to the row.

@cixzhang
