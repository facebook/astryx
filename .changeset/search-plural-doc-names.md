---
'@astryxdesign/cli': patch
---

[fix] `astryx search` finds a guide when the query is its route or title in the other number: `side panel` finds the side panels guide first again, and `header and footer` finds headers and footers. A section's heading still doesn't count as its topic's name, so `font size` keeps finding Text first.

@josephfarina
