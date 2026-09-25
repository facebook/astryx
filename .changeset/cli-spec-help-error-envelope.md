---
'@astryxdesign/cli': patch
---

[fix] With `--json`, `astryx help <unknown-command>` and a command group run without a subcommand (such as `astryx layout --json`) now return an error envelope, with `ERR_UNKNOWN_COMMAND` or `ERR_MISSING_ARGUMENT`, instead of a success-shaped help envelope. Both still exit 1, as they do without `--json`.

@josephfarina
