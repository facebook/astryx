---
'@astryxdesign/core': patch
---

[feat] `DropdownMenu` takes `header` and `footer`: content above and below the rows that sits in the popover beside the menu, never inside it. This is the place for a filter field or a "Create" button. The menu still holds only its rows, so it stays a valid menu to a screen reader. The controls keep their own keys and presses, and Tab walks header, menu, footer. The bottom sheet shows them above and below the actions. (#7344)

@cixzhang
