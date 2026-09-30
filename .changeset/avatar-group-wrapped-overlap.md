---
'@astryxdesign/core': patch
---

[fix] AvatarGroup keeps its overlap when avatars are wrapped in a HoverCard or Tooltip. Every avatar and the overflow indicator now take the overlap margin, and the group pads its start edge to match, so the overlap no longer depends on each avatar being a direct child of the group.

@ksying
