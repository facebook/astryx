---
'@astryxdesign/core': patch
---

[fix] Keep multi-digit List and Markdown counters on one line in a shared number column, so sibling text and nested lists stay aligned. Bullets and the text inset of short-only lists without task items retain their existing spacing; numbered rows beside task items move to share the checkbox's text start. Short numbers are right-aligned in their marker, moving the digits a few pixels closer to their text. Markdown task lists with nested or other block content place each checkbox on its item's first line and name it by that item's own text, instead of centering it against the whole body and naming it by all nested content inside a “Task list” group; those lists retain list semantics without that extra group. Paragraph-only pure task lists are unchanged. Browsers without CSS subgrid keep readable, unbroken counters in the existing flex layout, without the shared-column alignment enhancement.
@imdreamrunner
