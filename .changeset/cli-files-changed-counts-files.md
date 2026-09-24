---
'@astryxdesign/cli': patch
---

[fix] `upgrade`'s `filesChanged` counts files again, not (codemod, file) pairs.

One source file that four codemods each changed was reported as four files
changed. The total was incremented once per transform per file, so it equalled
`transformsApplied` in every run and the documented meaning of the field —
"Total files changed" — was never true. The human summary said the same thing:
"Found 4 changes across 4 files" for one file.

`filesChanged` is now the count of distinct files; `transformsApplied` keeps
counting (codemod, file) changes. A file that both a core codemod and an
integration codemod changed counts once. Both numbers are in the receipt and
they answer different questions.

@josephfarina
