---
'@astryxdesign/cli': patch
---

[fix] `astryx init` and `astryx upgrade --apply` no longer write the managed agent-docs block through an agent file or `.claude/` directory that is a symlink pointing outside the project. Init reports a path-safety error for that file and exits 1, and upgrade reports the refresh as failed, before any file is written.

@josephfarina
