---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` now keeps the managed agent-docs block (`<!-- ASTRYX:START --> … <!-- ASTRYX:END -->`) in sync with the installed version on **every** path — including the up-to-date and no-codemods short-circuits that previously returned before any refresh, leaving AI agents reading a stale component index and superseded rules. The block documents the installed library, so it's now refreshed up front (independent of codemods) and reported in the `--json` receipt as `agentDocs`. One detection pass covers three cases: a stale block is rewritten (`--apply`) or reported as a pending change (dry-run, which no longer writes); a project with core installed but no managed block is nudged to run `astryx init --features agents`; an already-current block stays silent. (#4168, #4169)

@josephfarina
