---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> <path>` and `astryx layout expand` now say when they replaced Astryx demo media. The `template.copy` and `layout.expand` receipts carry `demoMediaReplaced`, the number of demo image and video references that became placeholders, and the text output names the file to update (when `layout expand` prints the code instead, the same line follows it as a comment, so the output is still valid TSX). Nothing about the copy itself changed.

@josephfarina
