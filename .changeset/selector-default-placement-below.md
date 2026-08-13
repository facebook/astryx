---
'@astryxdesign/core': minor
---

[breaking] Selector menus open below the trigger by default (#4227). The old native-select behavior — the open menu overlaying the trigger with the selected option pinned over it — is now opt-in via `hasSelectedItemOverlay`. `placement` keeps working as before and now documents its `'below'` default; Selector menus also gain the standard `--spacing-1` clearance that DropdownMenu, MultiSelector, and ComplexSelector already use (search mode included, which used to sit flush).

Why the flip: the overlay covered the trigger while it kept DOM focus (WCAG 2.4.11 focus-obscured territory), quietly degenerated once the selected option sat past the listbox fold (the menu pinned to the top of the viewport, including in the no-value placeholder state every form starts in), and made default Selector the odd one out — MultiSelector, ComplexSelector, DropdownMenu, and Selector-with-hasSearch all open below already. To restore the previous look on a given instance, add `hasSelectedItemOverlay`.

@AKnassa
