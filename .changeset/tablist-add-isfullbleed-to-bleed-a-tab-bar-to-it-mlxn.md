---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] TabList: add an `isFullBleed` prop so a tab bar can bleed out to its container's inline content edges instead of requiring hand-written negative-margin CSS (#2622). Like Divider's `isFullBleed`, it cancels the nearest padded Layout container's `--container-padding-inline-*` custom properties with negative margins; it is inline-only, so a `hasDivider` underline spans the full content width while block-edge docking stays with the surrounding layout. The `detail-page` template now uses the prop and its `tabsRow` custom CSS shrinks to the block-dock margins only.
@jiunshinn
