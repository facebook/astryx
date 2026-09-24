---
'@astryxdesign/cli': patch
---

[fix] `astryx init`, `astryx init --remove-agents` and `astryx upgrade --apply` no longer edit or delete a file outside the project through an agent file or `.claude/` directory that is a symlink pointing there. Init reports a path-safety error for that file and exits 1, `init --remove-agents` fails with `ERR_PATH_TRAVERSAL` and exits 1 instead of reporting the block removed, and upgrade reports the refresh as failed, before any file is written.

@josephfarina
