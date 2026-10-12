---
'@astryxdesign/cli': minor
---

[breaking] An empty-string argument no longer discards the rest of the command. (#6620)

- incompatible-fix `IFIX-0003` / cleanup `CLN-0009`

Migration: remove the empty string from the invocation; the documented way to list is to omit the argument.

@josephfarina
