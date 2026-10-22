---
'@astryxdesign/cli': patch
---

[docs] `astryx docs cli/commands/postinstall` now documents the hidden `postinstall` hook, `astryx docs cli/commands` lists it, and `astryx postinstall --help` shows its exit code and an example. The summary of `astryx docs cli/commands/manifest` (text and `--json`) drops its final period, so it matches the description the manifest has always printed. What each command prints when it runs, its JSON and its exit codes are unchanged.

@josephfarina
