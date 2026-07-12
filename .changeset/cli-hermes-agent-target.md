---
'@astryxdesign/cli': patch
---

[fix] `astryx init --features agents` now supports `--agent hermes`. The preset injects the component index into an existing `.hermes.md`/`HERMES.md` (Hermes Agent's top-priority project-context files) and otherwise creates root `AGENTS.md`, which Hermes loads from the project root — unlike the `.claude/CLAUDE.md` default. Additive only: existing `claude`/`cursor`/`codex`/`all`/auto-detect behavior is unchanged. (#2187)

@harjothkhara
