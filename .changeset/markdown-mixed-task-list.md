---
'@astryxdesign/core': patch
---

[fix] Markdown: a list that mixes task and plain items shows each task item's checkbox
@cixzhang

In a list such as `- [x] Done`, `- Plain`, `- [ ] Open`, each task item now shows its own read-only checkbox, checked or open and named by its text, where its marker would be, and each plain item keeps its marker; the list stays one list. Before, the task items lost their checked state and showed bullets. Lists of only task items are unchanged.
