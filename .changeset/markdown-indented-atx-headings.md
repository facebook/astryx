---
'@astryxdesign/core': patch
---

[fix] Markdown: read an ATX heading indented up to three spaces as a heading
@cixzhang

`Markdown` now reads a heading line indented by up to three spaces, such as `   # Title`, as a heading, as CommonMark specifies. Such lines used to show as plain text with their `#` marks, except at the very start of a streamed message.
