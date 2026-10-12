---
'@astryxdesign/core': patch
---

[fix] A DropdownMenu hung off its own control through `renderTrigger` names a drilled-in sub-menu's Back row after the menu: "Back to <the menu's aria-label>", or the name of the control it hangs off, instead of "Back to Menu".

@vjeux
