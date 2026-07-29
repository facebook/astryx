---
'@astryxdesign/core': patch
---

[fix] With `statusVariant="detached"`, bordered inputs no longer render a status icon inside the control (this also covers DateTimeInput, which is fixed to the detached presentation) — the detached message box already carries a leading icon, so the on-field glyph was a duplicate. Also centers the detached message's icon on the first line of text.

@cixzhang
