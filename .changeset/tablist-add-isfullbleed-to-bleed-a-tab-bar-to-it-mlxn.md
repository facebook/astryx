---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] TabList: add an `isFullBleed` prop so a tab bar can bleed out to its container's inline content edges instead of requiring hand-written negative-margin CSS (#2622). Like Divider's `isFullBleed`, it cancels the nearest padded Layout container's `--container-padding-inline-*` custom properties with negative margins; the inner strip pads back by the amount the bleed exceeds a tab stop's own padding so edge labels remain aligned to the content inset. It is inline-only, so a `hasDivider` underline spans the full width while block-edge docking stays with the surrounding layout. The `detail-page` template now uses the prop, aligns its ghost panel toggle with the container inset, and keeps only its hand-tuned block-dock margins in `tabsRow`.
@jiunshinn
