---
'@astryxdesign/core': patch
---

[feature] Under a finger, on every touch device, DropdownMenu and MoreMenu grow out of their trigger on UIKit's open spring and collapse back into it on the close spring, as UIMenu does. Both run on the compositor and can be interrupted either way. Under Reduce Motion the menu fades in place (the animator's policy). A pan that starts outside the open menu dismisses it as the page scrolls, and focus that was in the menu returns to the trigger. Under a mouse, or with `presentation="popover"`, the menu keeps the layer's entrance and the theme's motion.

@vjeux
