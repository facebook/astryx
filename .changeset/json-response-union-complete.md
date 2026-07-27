---
'@astryxdesign/cli': patch
---

[fix] Register all emitted response types in the `--json` envelope union

Three response types were defined, exported, and emitted by commands but never added to `CLIAnyResponse` — the union that `jsonOut()` type-checks payloads against: `component.full`, `component.detail.blocks`, and `upgrade.status`. Because their discriminators were missing from the map, `jsonOut('upgrade.status', …)` (and the two component variants) were rejected by the type-checker, and their payload shapes weren't actually being validated. `build.help` had no response type at all. Added a `BuildHelpResponse` type and wired all four into the union so every `--json` envelope the CLI can emit is now type-checked against a declared shape.

@josephfarina
