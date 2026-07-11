---
'@astryxdesign/core': patch
---

[fix] Calendar: move aria-selected from the day button onto its gridcell wrapper. A plain button (implicit role "button") does not permit aria-selected, which tripped the axe aria-allowed-attr rule; the selection state belongs on the gridcell role in an ARIA grid. (#3343)

@cixzhang
