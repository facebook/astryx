---
'@astryxdesign/core': patch
---

[docs] Document every `themeProps()` selector surface in `theming.targets` (AvatarGroup, CommandPalette, InputGroup, Outline, ProgressBar, Table, AlertDialog, CheckboxList, PowerSearch) and bring the translated `docsZh` blocks into lockstep with `docs`. A new `scripts/check-theming-targets.mjs` CI gate now fails when a component's `themeProps()` call sites drift from its documented `theming.targets`, replacing the recurring manual sweeps.
@Lee-Dongwook
