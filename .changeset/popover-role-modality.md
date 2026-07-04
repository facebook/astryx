---
'@astryxdesign/core': patch
---

[fix] usePopover: add a `role` (`'dialog' | 'none'`) and `isModal` option so listbox and menu popups no longer announce a false modal dialog. Selector, MultiSelector, BaseTypeahead, PowerSearch, DropdownMenu, TabMenu, and the Chat mention menu now expose their own `listbox`/`menu` role instead of being wrapped in `role="dialog" aria-modal="true"` while focus stays on the trigger. Genuine dialog popovers are unchanged (#3343).
@cixzhang
