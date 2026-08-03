---
'@astryxdesign/core': patch
---

[fix] Deprecate the `isRtl` option on `useListFocus` and `useGridFocus`. Right-to-left arrow-key direction is now auto-detected from the container, so the explicit override is redundant and will be removed in an upcoming major — omit it and RTL is handled automatically.
@nynexman4464
