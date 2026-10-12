---
'@astryxdesign/core': patch
---

[feat] `CodeBlock` renders `language="diff"` (and `patch`) as a unified diff: added lines sit on a success-tinted row and removed lines on an error-tinted row, while file and hunk headers and context lines keep ordinary paint. The text keeps its normal colour and the leading `+`/`-` stays in the displayed and copied text, so the change reads without colour and copies exactly. Markdown ```diff fences get this for free.
@cixzhang
