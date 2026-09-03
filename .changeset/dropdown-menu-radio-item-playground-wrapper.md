---
'@astryxdesign/core': patch
---

[fix] DropdownMenuRadioItem: add playground wrapper and wire wrapper selection state for docsite preview

Wraps DropdownMenuRadioItem in DropdownMenuRadioGroup wrapper and keeps the wrapper's selection independent from the item's value knob, so aria-checked stays false until the item is activated and updates on click.

@Geervan
