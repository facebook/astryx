---
'@astryxdesign/core': patch
---

[fix] Selector: collapse an option's mark column when its resolved selection indicator renders nothing.

Unselected rows using the default check indicator no longer lose label width to an empty wrapper. Selected marks and themed indicators that render an unselected state keep their space at the configured logical edge.

@athz
