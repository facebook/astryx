---
'@astryxdesign/cli': patch
---

[fix] When a command's module fails to load, running that command with `--json` now prints one error envelope (`ERR_UNKNOWN`, with the load error in the message) instead of printing nothing to stdout. Without `--json` the error is still printed to stderr, and the exit code is still 1 in both modes.

@josephfarina
