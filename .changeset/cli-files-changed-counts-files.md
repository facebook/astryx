---
'@astryxdesign/cli': patch
---

[fix] `upgrade`'s `filesChanged` counts files, not (codemod, file) pairs (#6622)

One source file that four codemods each changed was reported as four files changed, so `filesChanged` matched `transformsApplied` and the documented meaning, "Total files changed", was not true. The human summary said the same thing: "Found 4 changes across 4 files" for one file.

`filesChanged` is now the count of distinct files, and `transformsApplied` still counts (codemod, file) changes. A file that both a core codemod and an integration codemod changed counts once.

@josephfarina
