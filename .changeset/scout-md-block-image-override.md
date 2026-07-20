---
'@astryxdesign/core': patch
---

[fix] Markdown honors the `components.image` override for standalone (block) images, matching the inline image path. A standalone `![alt](src)` line parses as a block image, whose render path previously hardcoded a bare `<img>` and ignored a supplied `components.image`; it now uses the override just like an inline image does.
@lexs
