---
'@astryxdesign/cli': patch
---

[feat] `astryx init --features agents` now defaults to creating root `AGENTS.md` — the tool-agnostic standard that Codex/Copilot, Cursor, and most agents read — instead of the Claude-specific `.claude/CLAUDE.md`. Claude output is now opt-in via `--agent claude` (→ `.claude/CLAUDE.md`), and `--agent all` still writes both. Projects with existing agent-doc files are unaffected: init still discovers and updates every file already present, so this only changes the from-scratch default. (#4216)

@josephfarina
