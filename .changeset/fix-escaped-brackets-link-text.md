---
'@astryxdesign/core': patch
---

[fix] Markdown: keep escaped closing brackets inside inline link text

An escaped `\]` in a link label no longer ends the label early, so
`[\[DISCUSS\] Clarify](https://example.com)` parses to one link with the
complete label instead of plain text. The label-end scan now skips brackets
preceded by an odd backslash run, reusing the existing escape check.

@dedsec-terminal
