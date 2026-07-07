---
'@astryxdesign/core': patch
---

[fix] Calendar: stop range-highlighting adjacent-month (outside) days, and cap the range highlight where it meets a disabled or adjacent-month day. In the two-month range view the same date renders in both panes, so the spillover copy on the neighbouring month's pane was drawn as part of the selection; outside days now never receive selection, range, or preview state. A highlighted day next to a disabled or outside day now gets a rounded end cap so the run reads as properly terminated instead of running square-edged into the gap. (#2715)
@cixzhang
