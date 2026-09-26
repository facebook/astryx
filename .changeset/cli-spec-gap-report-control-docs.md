---
'@astryxdesign/cli': patch
---

[fix] `astryx gap-report --help` and `astryx manifest` now describe the `component` argument and say that `component`, `--category`, and `--reason` are required unless `--list-categories` is set, with the character limits the command enforces. The manifest listed the argument with an empty description, and nothing said these inputs were required. (#6518)

@josephfarina
