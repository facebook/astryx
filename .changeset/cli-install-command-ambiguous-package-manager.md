---
'@astryxdesign/cli': patch
---

[fix] `template` and `build` choose the install command's package manager as AST-048 FR17 and FR19 specify. The nearest directory from the target up to the workspace root that has a `packageManager` field or a lockfile decides. With neither, the command uses npm, whatever package manager launched the CLI. When that directory's lockfiles disagree and nothing it commits picks one, `installCommand` is `null` and the note names the missing packages, the directory, and the lockfiles that disagree, instead of guessing a command that would write a second lockfile. (#7343)

@cixzhang
