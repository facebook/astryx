---
'@astryxdesign/core': patch
---

[fix] Selector and MultiSelector: with `statusVariant="detached"`, the on-field status icon is no longer shown inside the trigger. The detached message box already renders its own leading status icon, so the field keeps its chevron indicator instead of duplicating the glyph — matching the bordered inputs.
@cixzhang
