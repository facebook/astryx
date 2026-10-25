---
'@astryxdesign/core': patch
---

[feature] On a phone, a DropdownMenu sub-menu opens in place as UIMenu's does on iOS 26. The sub-menu's card grows down from the row it opened from, and the menu's box grows with it from the edge it is anchored by. The parent's rows stay under the card, faded to half and scaled to 97%. The sub-menu's header keeps the row's label, now semibold, with its chevron turned down; it is still named "Back to <parent>". Going back reverses it. The box's springs are the theme motion roles `springs.subMenuOpen` and `springs.subMenuBack`. Under Reduce Motion the views cross-fade.

@vjeux
