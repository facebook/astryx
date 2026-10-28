---
'@astryxdesign/cli': patch
---

[fix] `astryx integration verify` starts npm the way the rest of the CLI does: npm's own entry file, run with the Node that runs the CLI, when one is found. An `npm` earlier on the PATH that is not npm itself, such as a wrapper that refuses npm commands, no longer fails the check with "npm pack failed".

@josephfarina
