---
'@astryxdesign/cli': patch
---

[fix] Warn when an installed integration needs a newer CLI.

@josephfarina

When an integration declares `@astryxdesign/cli` in peerDependencies and
the running CLI is outside that range, the CLI now warns once per package in
`astryx doctor` and in the stderr nudge on everyday commands (component,
discover, docs, search, template, theme). The warning names the package, the
required range, the running version, and the upgrade command. No exit-code
change.
