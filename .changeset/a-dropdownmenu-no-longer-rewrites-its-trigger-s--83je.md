---
'@astryxdesign/core': patch
---

[fix] `usePopover`'s trigger ref now stays the same function when the popover's `onShow` or `onHide` changes, and `DropdownMenu`'s own trigger refs are stable too. A trigger that takes it (DropdownMenu, Breadcrumbs, ComplexSelector, DateInput, DateRangeInput, DateTimeInput, MultiSelector and the trigger menu of `ChatComposerInput`) is no longer detached and reattached on renders that pass new callbacks, so its style is not rewritten each time and a tooltip anchored to the same trigger keeps its place.
@vjeux
