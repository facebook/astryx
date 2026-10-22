---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuRadioGroup` (also exported as `ContextMenuRadioGroup`) takes a `title`: a visible heading above its radios, drawn like a `DropdownMenuGroup` heading, that names the group. With a title, `label` is optional, and the title names the group so the name always holds the visible heading: a caller's `aria-labelledby` is read after it, and `label` or a caller's `aria-label` is ignored, with a development warning when it differs from the title's text. A `title` that renders no text counts as no title. Give a menu section that holds one radio set this title instead of wrapping the set in a `DropdownMenuGroup`: the menu then exposes one group named by its heading rather than two nested groups with the same name. Without `title` nothing changes.

@vjeux
