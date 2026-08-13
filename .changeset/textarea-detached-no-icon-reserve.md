---
'@astryxdesign/core': patch
---

[fix] TextArea: no longer reserves trailing space for the on-field status icon when `statusVariant="detached"`. The detached variant surfaces its status glyph in the message box below the field and renders no on-field icon, so the reserved inset pushed the text in for an icon that never appeared. Trailing space is now reserved only when the spinner or on-field status icon actually renders. (#4940)

@freddymeta
