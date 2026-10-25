---
'@astryxdesign/core': patch
---

[fix] Button: disabled buttons no longer render the native `disabled` attribute. They stay focusable in keyboard tab order, retain focus when becoming disabled while focused, and expose `aria-disabled="true"`. All activation paths (mouse clicks, Enter, Space) and clickAction/onClick callbacks remain blocked without losing focus to the document body. A disabled named submit Button withholds its name so `new FormData(form, submitter)` omits its value (FR3). A ButtonGroup (or other roving group such as Pagination dots) that is disabled as a whole keeps its one Tab stop instead of dropping out of the Tab order, Carousel's hidden scroll buttons are never Tab stops, and a disabled ListInput reorder handle moves nothing from the keyboard. This satisfies AST-085 (FR1–FR4, FR6, FR7). Tests that assert `toBeDisabled()` or `:disabled` should query `[aria-disabled="true"]` instead.

@Geervan
