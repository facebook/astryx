---
'@xds/core': patch
---

Make `XDSList` and `XDSCheckboxList` render a distinct `spacious` density for list items. Previously `balanced` and `spacious` both fell back to the same default item padding, so switching between the two densities had no visible effect.
