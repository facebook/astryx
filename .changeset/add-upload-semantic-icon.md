---
'@astryxdesign/core': patch
---

[fix] Add a semantic `upload` icon with a distinct upload-to-tray fallback, and use it in FileInput instead of the directional `arrowUp` icon. Existing complete icon registries may omit `upload` and continue using the default fallback.

@rubyycheung
