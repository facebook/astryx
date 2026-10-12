---
'@astryxdesign/cli': minor
---

[breaking] Refuse invalid input that used to silently succeed.

- incompatible-fix `IFIX-0007` / cleanup `CLN-0013`

Migration: pass a valid type or package, an integer limit, or the documented arguments, and catch `ERR_AMBIGUOUS_COMPONENT` for a multi-package name.

@josephfarina
