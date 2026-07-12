---
'@astryxdesign/core': patch
---

[fix] Toast: onHide fires exactly once, and a paused auto-hide timer survives viewport re-renders (#3589)

A second dismissal during the exit transition (double-click, auto-timer plus manual dismiss()) double-fired onHide; and because the timer effect depended on the viewport's per-render onDismiss identity, any other toast arriving or leaving silently restarted — and un-paused — every mounted toast's auto-hide timer. Exiting toasts are now tracked in a ref before onHide fires, and the timer reads onDismiss through a ref so it only restarts on a genuine duration change and respects the paused state.
@arham766
