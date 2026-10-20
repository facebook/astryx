---
'@astryxdesign/core': patch
---

[fix] `useTooltip` (and every component built on it, such as `Button`'s `tooltip` prop) now drops a show that is still waiting out its delay when `isEnabled` turns `false`. Before, hovering a trigger and then disabling its tooltip within the delay let the timer fire anyway: the tooltip opened after its triggers were turned off, with no pointer-leave listener left to close it. A pending hide still runs, and an enabled tooltip is unchanged.

@cixzhang
