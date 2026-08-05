---
'@astryxdesign/core': patch
---

[feat] Timestamp: two additions. (1) A new `system_unix` format renders the value as Unix time in whole seconds since the epoch (e.g. `1771520400`) — an absolute, zone-independent machine value, useful as a copyable `tooltipEntries` row alongside human-readable zones. It joins the `system_*` machine-readable family and, being absolute, ignores any tooltip time zone. (2) The copyable hover card's copy button now shows a visible `Copy` tooltip on hover/focus (flipping to `Copied` after a copy, in step with the icon), so the affordance is discoverable for sighted users; the full `Copy <value>` string remains the button's aria-label for assistive tech. Both additive — no change to existing formats or default rendering.

@freddymeta
