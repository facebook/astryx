---
'@astryxdesign/core': patch
---

[fix] A `DropdownMenu` with `header` or `footer` is now exposed as a modal dialog around its menu, as the APG Dialog pattern requires. The popover is a named `role="dialog"` with `aria-modal` and the `role="menu"` inside it; the trigger says `aria-haspopup="dialog"` and its `aria-controls` names the popover holding the dialog. Tab and Shift+Tab wrap through the header, the menu and the footer instead of closing the menu at either end. Escape still closes and returns focus to the trigger. A menu without either prop is unchanged.

@cixzhang
