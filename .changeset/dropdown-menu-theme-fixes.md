---
'@astryxdesign/core': patch
---

[fix] DropdownMenu: move the `dropdown-menu-indicator-icon` theme target onto the Icon element itself so a theme can restyle the submenu chevron's size and color directly.

The loading branch no longer carries the target — its `Spinner` has its own `astryx-spinner` target, matching Selector, MultiSelector and ComplexSelector.

@athz
