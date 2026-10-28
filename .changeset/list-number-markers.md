---
'@astryxdesign/core': patch
---

[fix] Keep multi-digit List and Markdown counters on one line in a shared number column, so sibling text and nested lists stay aligned. Bullets and the text inset of short-only lists retain their existing spacing. Short numbers are now right-aligned in their marker, moving the digits a few pixels closer to their text. Browsers without CSS subgrid keep readable, unbroken counters in the existing flex layout, without the shared-column alignment enhancement.
@imdreamrunner
