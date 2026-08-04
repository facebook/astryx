---
'@astryxdesign/core': patch
---

[feat] Timestamp: the hover surface is now a single copyable hover card for every timestamp that shows one. Relative timestamps and `tooltipEntries`-configured timestamps share one card, replacing the old read-only tooltip; the default single row carries the full absolute time and is itself copyable.

Each `tooltipEntries` row opts into a copy button via `isCopyable` (default `false`) — so a card can mix human-readable, read-only rows with a copyable machine value (e.g. show local and UTC for reading, but only let readers grab the `system_date_time` value). Copyable rows render their copy button in a dedicated trailing action column so the buttons align down one column regardless of value width; that column is only reserved when some row is copyable, so a fully read-only card carries no trailing gutter. The card's labels use the `supporting` text role (the secondary, quieter register that is Timestamp's own default) and values the `body` role.

This is a behavior and visual change for relative timestamps — hovering now reveals a copyable card instead of a plain tooltip.

@freddymeta
