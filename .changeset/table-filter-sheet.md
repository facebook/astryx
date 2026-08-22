---
'@astryxdesign/core': patch
---

[feat] `useTableFiltering`: on a narrow viewport the filter controls leave the table header for a bottom sheet, opened from one Filter button that carries the active-filter count. A header cell is the wrong home for a filter on a phone — the column is too narrow to hold a control, and a popover anchored to it covers the rows the filter is meant to narrow. The sheet applies each change as it is made and has no scrim, so the rows behind stay visible and keep updating; short enum filters render as a list of checkboxes or radios rather than a Selector, so nothing opens a second layer on top of the sheet. `sheetBreakpoint` moves or disables the threshold (`'sm'` by default, `'none'` to keep the header controls at every width), `variant: 'sheet'` takes the presentation at any width, and `defaultIsMobile` seeds it for SSR.

@imdreamrunner
