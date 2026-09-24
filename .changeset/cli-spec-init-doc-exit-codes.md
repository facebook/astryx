---
'@astryxdesign/cli': patch
---

[docs] `astryx init --help` and the manifest now say how init's flags interact: `--remove-agents` only removes the managed block and ignores the install flags, `--all` overrides `--features`, and `--agent` and `--agent-docs-path` apply only when agent docs are installed, with an explicit path taking precedence. The documented exit codes now include an `--agent-docs-path` outside the project (exit 1) and no longer list two template cases the CLI cannot reach.

@josephfarina
