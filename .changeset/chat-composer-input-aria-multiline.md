---
'@astryxdesign/core': patch
---

[fix] ChatComposerInput: drop `aria-multiline` once triggers make the editable a combobox

`aria-multiline` was hardcoded on the contenteditable element while `useTriggerMenu` owns its role, so configuring `triggers` switched the role to `combobox` — which ARIA 1.2 does not list `aria-multiline` under — and axe flagged `aria-allowed-attr` (critical) on the 8 ChatComposerInput trigger stories and the 2 ChatLayout stories that render one. Moves the attribute into the hook's `ariaProps`, where the role and the attributes whose validity depends on it are decided together.

@Kyujenius
