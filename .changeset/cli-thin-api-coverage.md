---
'@astryxdesign/cli': patch
---

[feat] CLI: full API coverage for the `build`, `swizzle`, `layout`, and `validate` commands — each is now scriptable through the `./api` barrel with the CLI as a thin parse → API call → render wrapper. `build` gains `--json` output. Behavior is unchanged for existing command usage. (#4302)
@josephfarina
