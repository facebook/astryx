---
'@astryxdesign/core': patch
---

[fix] An anchored layer (`useLayer`, `Popover`, `DropdownMenu` and its sub-menus) is capped to the visible viewport minus its gutters, and its gutters clear the device's safe-area insets. Before, the shipped stylesheet only ever applied the fallback caps: the large viewport (`100vh`, `100vw`) without the safe-area insets, so on iOS Safari a layer taller than the screen ran past the visible bottom and over a bar declared through `LayerProvider`'s `inset`. Browsers without `dvb` or `env()` keep that fallback.

@vjeux
