---
'@astryxdesign/core': patch
---

[fix] Bottom Sheet: tighten the grab handle bar to 24px

The drag area above the sheet's content was 48px tall, which read as an empty
band between the sheet's top edge and its first line of content. It is now
24px (`--spacing-6`), keeping the pill centered and giving the content back
the other 24px of the sheet's height budget.

@imdreamrunner
