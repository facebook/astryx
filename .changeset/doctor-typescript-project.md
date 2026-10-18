---
'@astryxdesign/cli': patch
---

[chore] Internal groundwork for `astryx doctor integration components`: finding the project's own `typescript`, and reading a package's TypeScript project the way `tsc` reads it (its own `tsconfig.json` or a monorepo root's, a solution-style config's references, and the declaration files the config includes). Nothing reaches it yet, so the CLI's behavior and output do not change.

@josephfarina
