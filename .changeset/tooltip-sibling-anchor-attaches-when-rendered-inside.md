---
'@astryxdesign/core': patch
---

[fix] Tooltip: attach sibling-mode anchors that render inside their own anchor (#7692)

A `Tooltip` with an `anchorRef` that renders inside the very element the ref points at (how `SideNavItem` anchors its collapsed rail tooltip) never attached: React attaches an ancestor's ref after its descendants' layout effects, so the sibling-mode effect read `anchorRef.current` as `null` on mount, and its dependencies never changed to re-run it. An item that mounted inside an already-collapsed `SideNav` — the common case for persisted collapse state — showed no tooltip on hover and never got `aria-describedby`, while an item that collapsed after mounting worked because the anchor ref was already set by then.

The effect now re-checks the anchor once the commit has finished attaching refs, so the tooltip attaches however it mounted. The attach/detach bookkeeping (event listeners, `aria-describedby` merge and restore) is unchanged.

@Pushpak731
