---
'@astryxdesign/cli': patch
---

[fix] template: show a grouped summary by default instead of the full catalog
@josephfarina

Bare `astryx template` (no name, no `--list`) now shows templates grouped by category with counts — about 21 KB instead of the full 149 KB catalog. The full catalog with descriptions is still reachable via `astryx template --list`.

JSON output is unchanged — `--json template` still returns the complete `template.list` response. This is a text-only rendering change under AST-017 FR11: the machine-readable response schema is the contract; text formatting is not.

Trade-off: the grouped output still includes every template id (so `template <id>` works from a copy-paste), at the cost of ~21 KB. An even shorter summary (type + count only, no ids) would be ~500 bytes but would require a second step to discover any id. The current shape serves both human scanning and agent copy-paste without a round-trip.
