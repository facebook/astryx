---
'@astryxdesign/core': patch
---

[fix] ProgressBar: determinate progress now uses `role="progressbar"` instead of `role="meter"`. `meter` is for static gauges (disk usage, battery) that screen readers do not treat as live-updating task indicators; a progress bar conveys task completion and should be announced on update. Indeterminate progress was already `progressbar` (#3343).
@cixzhang
