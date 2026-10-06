---
'@astryxdesign/core': patch
---

[feat] An option can carry a secondary action; `MultiSelector` renders it in a grid.

`SelectorOptionData` and `SearchableItem` gain `action?: ReactNode`: one node
the caller renders and names — an `IconButton`, a `Button`, a menu trigger.
In `MultiSelector`, once any option carries one the popup is a `role="grid"`
whose rows pair the option with its action: Up/Down move rows, the inline-end
arrow reaches the action (following RTL), Enter fires it, pointer and touch
press it directly, and pressing it never changes the selection. The trigger
advertises `aria-haspopup="grid"`. Nothing changes for options without an
action. `Selector` and the typeahead panel do not render the key yet and warn
in development when an item carries one.

@vjeux
