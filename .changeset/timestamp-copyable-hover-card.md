---
'@astryxdesign/core': patch
---

[feat] Timestamp: the hover surface is now a single copyable hover card for every timestamp that shows one. Relative timestamps and `tooltipEntries`-configured timestamps share one card, replacing the old read-only tooltip; the default single row carries the full absolute time and is itself copyable. `tooltipEntries` customizes the card's rows. This is a behavior and visual change for relative timestamps — hovering now reveals a copyable card instead of a plain tooltip.

@freddymeta
