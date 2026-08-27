---
'@astryxdesign/core': patch
---

[fix] Markdown now applies the same URL safety rule to every image path it parses: reference-style images (`![alt][label]` and the shortcut form) and standalone block images pass through the check inline images and links already used, and the render-side guard normalizes control characters before testing so both layers see a URL the way a browser will.

@bhamodi
