---
'@astryxdesign/core': patch
---

[fix] Dialog, AlertDialog, CommandPalette, BottomSheet, Lightbox: Tab now wraps inside an open modal. Tab from the last control moves to the first, and Shift+Tab from the first moves to the last, so keyboard and screen-reader users no longer land in the browser's toolbar from inside a modal. Every modal now uses the same focus-region module that Drawer and Popover use. When modals nest, the innermost one handles Tab. Non-modal sheets and inline dialogs do not trap focus. This meets `component:Dialog` DEC-2. Fixes #8841.

@cixzhang
