---
'@astryxdesign/cli': patch
---

[fix] upgrade now runs core codemods before loading config, so a config codemod can repair an otherwise-invalid config; dry-run reports a fixable config and suggests the command to apply it.

@ejhammond
