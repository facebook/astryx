---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build`: the icon-registry import in the generated module is now resolved against the output directory — rewritten onto the compiled registry (preferring `.mjs`), or failed with `ERR_THEME_ICON_UNRESOLVED` when nothing in the output satisfies it, instead of emitting a module that cannot load.
@AKnassa
