---
'@astryxdesign/core': patch
---

[fix] useContainerReveal: eliminate the exit flicker on the default (non-layout-preserved) reveal. Hidden content flips `position: static -> absolute` discretely, which previously snapped it out of layout flow at full opacity before the fade could run. The flip now participates in the transition with `transition-behavior: allow-discrete` and a state-conditional delay, so it stays in flow until the opacity fade finishes on exit while remaining immediate on entry. Content stays in the accessibility tree and tab order throughout.

@cixzhang
