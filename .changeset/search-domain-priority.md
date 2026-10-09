---
'@astryxdesign/cli': patch
---

[fix] `astryx search` ranks a component, hook, or template that a query word names above a doc that matched only by keyword, heading, or text. `font size` finds Text first again instead of a typography guide. A doc the query names, such as `font setup` or `migration`, or one whose title the query holds, such as `resizable side panels`, keeps its place. Result scores do not change; only the order between domains moves.

@josephfarina
