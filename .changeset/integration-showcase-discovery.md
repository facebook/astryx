---
'@astryxdesign/cli': patch
---

[feature] Integration packages can now provide component showcases. Blocks authored under an integration's `templates` root (with `isShowcase: true`) are discovered by `component <Name> --showcase` and `--blocks`, so external packages get the same CLI-served preview model as core — no separate `astryx.blocks` field needed. Split families (e.g. a Link + HoverCard sharing one showcase) resolve via `componentsUsed`.

@ejhammond
