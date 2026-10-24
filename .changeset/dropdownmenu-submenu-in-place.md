---
'@astryxdesign/core': patch
---

[feature] On a phone, a DropdownMenu sub-menu opens in place as UIMenu's does on iOS 26: the menu's box grows to fit the sub-menu from the edge it is anchored by, the parent stays behind as a card at 97% scale and 3 px lower with its row faded, and the sub-menu's header shows the row's label with its chevron turned down (it is still named "Back to <parent>"). Going back reverses it. Under Reduce Motion the views cross-fade.

@vjeux
