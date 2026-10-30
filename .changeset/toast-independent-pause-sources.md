---
'@astryxdesign/core': patch
---

[fix] `Toast` keeps its auto-dismiss timer paused until every reason for the pause has ended. Hover, focus inside the toast, a window blur and a held swipe each paused the same single flag, so leaving one of them (moving the mouse away while a button inside the toast still had keyboard focus, for example) restarted the countdown and the toast could dismiss out from under the focused user. Each reason now counts separately and the timer resumes only when the last one releases.

@thecodebasedot
