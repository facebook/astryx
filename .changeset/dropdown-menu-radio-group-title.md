---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuRadioGroup` (also exported as `ContextMenuRadioGroup`) takes a `title`: a visible heading above its radios, drawn like a `DropdownMenuGroup` heading, that names the group. With a title, `label` is optional. Give a menu section that holds one radio set this title instead of wrapping the set in a `DropdownMenuGroup`, so a screen reader announces one group with one name rather than two nested groups with the same name. Without `title` nothing changes.

@vjeux
