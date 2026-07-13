---
'@astryxdesign/cli': patch
---

[fix] `astryx init` now validates `--agent`. An unrecognized value (e.g. a typo like `--agent claud`) previously fell through and silently created `AGENTS.md` with a success exit code; it now errors with `Unknown agent "…". Valid: claude, cursor, codex, hermes, all` and a non-zero exit, matching the existing `--features` validation. Valid agents are unchanged.

@harjothkhara
