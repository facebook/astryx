---
'@astryxdesign/core': patch
---

[fix] DropdownMenu: make the submenu indicator icon and menu divider spacing actually themable. The `astryx-dropdown-menu-indicator-icon` target now sits on the chevron glyph itself (not the wrapper span), so a theme can restyle its size; and the menu divider's vertical margin is exposed via `--_dropdown-menu-divider-margin` so it can be retuned without out-specifying the global divider slot.
@athz
