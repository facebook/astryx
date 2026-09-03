---
'@astryxdesign/core': patch
---

[fix] DropdownMenuRadioItem: add playground wrapper and wire wrapper selection state for docsite preview

Wraps DropdownMenuRadioItem in DropdownMenuRadioGroup wrapper and binds wrapper selection state to active item value so aria-checked updates accurately on knob changes and click selection.

@Geervan
