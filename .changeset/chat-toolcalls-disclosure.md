---
'@astryxdesign/core': patch
---

[fix] Chat: tool-call rows and the tool-calls group header now expose complete disclosure semantics — expandable call rows announce `aria-expanded` and reference their detail panel via `aria-controls`, and the group header references its content region. Previously an expandable call row was announced as a plain button with no indication it opens anything. (#3720)
@bhamodi
