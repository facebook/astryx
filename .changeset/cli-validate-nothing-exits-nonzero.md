---
'@astryxdesign/cli': minor
---

[breaking] `doctor integration validate` exits 1 when there is no package.json.

- incompatible-fix `IFIX-0008` / cleanup `CLN-0014`

The no-package.json case now carries a `no_package` error-severity issue, so the existing exit rule (exit 1 on error-severity issues) covers it. A directory with package.json but no integration manifest stays exit 0 as published.

Migration: run the command in a directory that has a `package.json`, or handle exit 1 for that case.

@josephfarina
