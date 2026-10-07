---
'@astryxdesign/cli': minor
---

[breaking] IFIX-0006 -> CLN-0012 makes `theme build` exit 1 when it reports private `--_*` variables.

The old contract reported private-variable errors but exited 0. The corrected contract keeps the same warnings, receipts, generated files, and `--check` output, but exits 1.

To migrate, a CI step that relied on exit 0 must fix the theme's private `--_*` inputs.

@josephfarina
