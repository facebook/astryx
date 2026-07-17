---
'@astryxdesign/core': patch
---

[docs] Point AI agents to the CLI from the core README.

@joeyfarina

`@astryxdesign/core`'s README now leads with a callout telling AI agents to run `npx astryx init` first, which installs the CLI's component index into `AGENTS.md`/`CLAUDE.md`. In an isolated cold-start test, this took agents from 0/5 to 4/5 on discovering and using the CLI (matching the AGENTS.md ceiling); a first-run nudge alone did 0/5.
