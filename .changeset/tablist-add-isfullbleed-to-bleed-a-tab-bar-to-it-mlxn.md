---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] TabList: add an `isFullBleed` prop so a tab bar can bleed out to its container's content edges instead of requiring hand-written negative-margin CSS (#2622). Like Divider's `isFullBleed`, it cancels the nearest padded Layout container's `--container-padding-*` custom properties with negative margins; inline edges always bleed and the block edges bleed on first/last-child (as Table's container bleed does), so a bottom-docked tab bar's `hasDivider` underline meets the header divider without pulling a mid-content tab bar into its siblings. The `detail-page` template now uses the prop and drops its `tabsRow` negative-margin exception.
@jiunshinn
