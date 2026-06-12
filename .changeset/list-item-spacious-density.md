---
'@xds/core': patch
---

Align `XDSItem` with list-like component APIs by using `compact`/`balanced`/`spacious` density and `startContent`/`endContent` slots, then pass `XDSListItem` density through directly. Previously List’s `balanced` and `spacious` densities both fell back to the same item padding after `XDSListItem` was refactored to compose `XDSItem`.
