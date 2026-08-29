---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] TabList: add an `isFullBleed` prop so a tab bar can bleed out to its container's inline content edges instead of requiring hand-written negative-margin CSS (#2622). Like Divider's `isFullBleed`, it cancels the nearest padded Layout container's `--container-padding-inline-*` custom properties with negative margins; the inner strip pads back by the amount the bleed exceeds a tab stop's own padding so edge labels remain aligned to the content inset. It is inline-only: TabList owns the inline full bleed, and the container owns the block-end dock. For that, LayoutHeader gains a `paddingBlockEnd` per-edge override in Section's existing spelling — `paddingBlockEnd={0}` docks the header's last child on its bottom edge so a tab strip's underline meets `hasDivider` at any header padding. The `detail-page` template now uses both props, aligns its ghost panel toggle with the container inset, and no longer carries any hand-written tab-row CSS.
@jiunshinn
