---
'@xds/core': patch
---

`XDSBaseTypeahead` now uses a shared key fallback for runtime search results without `id` values, so id-less rows no longer all render as selected.
