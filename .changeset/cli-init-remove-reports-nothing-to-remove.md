---
'@astryxdesign/cli': minor
---

[breaking] `init --remove-agents` says when there was nothing to remove.

- incompatible-fix `IFIX-0004` / cleanup `CLN-0010`

Migration: a consumer reading `data.removed` as a boolean keeps working; a consumer that narrowed on the literal `true` sees the corrected value.

@josephfarina
