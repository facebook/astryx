---
'@astryxdesign/cli': patch
---

[feat] When the project's installed CLI (its own, or its workspace's) has `astryx doctor --built` (0.7.4 and later), the agent docs `astryx init` writes tell agents to run it before they deliver a build, and not to deliver a build that fails it. Before install, or on an older CLI, the line is left out; the next `init` or `upgrade --apply` adds it.

@josephfarina
