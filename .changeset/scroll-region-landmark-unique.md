---
'@astryxdesign/core': patch
---

[fix] Table, CodeBlock, and Markdown: the keyboard-focusable scroll containers now use `role="group"` instead of `role="region"`. `region` is a landmark, so multiple same-named scroll regions on one page (e.g. several tables labelled "Table") triggered axe `landmark-unique`. `group` keeps the label and keyboard focusability without creating duplicate landmarks. (#3343)

@cixzhang
