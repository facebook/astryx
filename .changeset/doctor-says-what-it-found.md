---
'@astryxdesign/cli': patch
---

[fix] Doctor says why it skipped a check and what it checked, and `doctor integration validate` no longer crashes on a folder it cannot read
@josephfarina

- A check that needs the loaded project quotes the reason the CLI could not load it, instead of only "Skipped".
- The config check warns when astryx.config imports but the CLI cannot load the project from it. Before, it said the config loaded cleanly.
- Integration contributions name the integrations they checked; with none loaded, the check reports info and says there is nothing to check.
- `astryx doctor integration validate` names a folder it cannot read and keeps checking. A declared root that is a file or that cannot be read is reported as `invalid_root` or `unreadable_root` instead of a raw error or a crash.

Classification: contract-restoring. No check becomes stricter: every new finding is a warning or info, and the only exit-code change is that an unreadable folder outside every root no longer crashes validation.
