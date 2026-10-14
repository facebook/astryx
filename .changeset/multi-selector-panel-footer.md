---
'@astryxdesign/core': patch
---

[feat] MultiSelector: `footer` renders caller content at the foot of the panel, under the list and outside the listbox, in both presentations, so a picker can end with a control of its own such as a door to where its options are managed. With a footer the popover is a modal dialog named by `label`: the trigger says `aria-haspopup="dialog"`, focus moves into the panel as it opens, and Tab and Shift+Tab cycle through the search field, its clear button, the list when it takes focus, and the footer's controls, wrapping at either end. Without a footer nothing changes.

@vjeux
