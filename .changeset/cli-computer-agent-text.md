---
'@astryxdesign/cli': patch
---

[feat] `astryx init --user` writes agent text for the whole computer: one skill file at `~/.agents/skills/astryx/SKILL.md` and `~/.claude/skills/astryx/SKILL.md`, from the same source as a project's agent-docs block but with no version, telling agents to follow a project's own agent docs inside that project. It works in any folder, writes only those two files, keeps any file there that Astryx did not write (or a symlink), and warns, while still writing, when no `astryx` command on the computer runs the Astryx CLI. `astryx init --user --remove-agents` removes them. The new `init.user` receipt lists each file and what happened to it. Nothing else writes the text: not installing the CLI, not `init` in a project, not `upgrade`. Outside a project, `astryx doctor` adds a `computer-agent-text` check (info only) that says whether the text is present and matches the release that answered.

@josephfarina
