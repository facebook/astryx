---
'@astryxdesign/cli': patch
---

[feat] `integration add theme --from <base>` forks an existing theme as the starting point instead of a blank scaffold. The new theme copies the base's source files — renamed and rewritten for the new slug — with no link back. Use `--from` when you want to change a lot; for a small change that stays linked, use `extends` in `defineTheme`.

@josephfarina
