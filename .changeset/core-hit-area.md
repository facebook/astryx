---
'@astryxdesign/core': patch
---

[chore] Internal: a shared touch hit-area utility (utils/hitArea.ts) works out how far a target may grow toward 44 px under a coarse pointer without taking a tap that is nearer a neighbour. No component uses it yet; no behavior change.

@cixzhang
