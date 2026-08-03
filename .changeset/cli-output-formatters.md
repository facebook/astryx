---
'@astryxdesign/cli': patch
---

[feat] CLI human (non-`--json`) output now renders through a small, documented formatter kit: consistent, plain-ASCII `key: value` records/sections that mirror `--json` and are greppable by field. Every command was migrated onto it (a lint rule keeps output funneled through the single `emit` sink), and `astryx --help` documents the output contract. `--json` output is unchanged. (#4686)
@joeyfarina
