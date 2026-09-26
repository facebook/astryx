---
'@astryxdesign/core': patch
---

[fix] Markdown: render escaped table pipes literally in code spans (#6642)

A `\|` used to keep a pipe inside a table cell now displays as `|` in inline code, matching prose cells without exposing the structural backslash. Completed inline-code spans render only their parsed contents inside `<code>`, without source backticks; standalone inline code otherwise remains unchanged.

@cixzhang
