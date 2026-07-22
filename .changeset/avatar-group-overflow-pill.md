---
'@astryxdesign/core': patch
---

[fix] `AvatarGroupOverflow` now grows into a pill for long `+N` counts so the number never clips.

The indicator was a fixed-size circle, so wide counts (e.g. `+4912`) overflowed and crowded the edges. It now uses a minimum width equal to the avatar size plus horizontal padding: short counts (`+5`) stay a perfect circle, while longer counts grow horizontally into a stadium/pill and remain legible. No new public props.

@cixzhang
