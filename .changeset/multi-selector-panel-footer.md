---
'@astryxdesign/core': patch
---

[feat] MultiSelector: `footer` renders caller content at the foot of the panel, under the list and outside the listbox, in both presentations, so a picker can end with a control of its own such as a door to where its options are managed. With a footer the popover is a modal dialog named by `label`: the trigger says `aria-haspopup="dialog"`, focus moves into the panel as it opens, and Tab and Shift+Tab cycle through the search field, its clear button, the list when it takes focus, and the footer's controls, wrapping at either end. A layer a footer control opens keeps its own Tab and Escape: `useFocusTrap` now leaves Tab to a trap active inside its container while focus is inside it, so Tab from a nested popover's last control wraps within that popover instead of moving to the outer layer's first stop. Without a footer nothing changes.

@vjeux
