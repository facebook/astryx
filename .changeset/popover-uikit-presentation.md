---
'@astryxdesign/core': patch
---

[feature] Under a finger (a coarse primary pointer, on any touch device), Popover is presented like a native popover: it grows out of its trigger on UIKit's present spring, wide before tall, with its edge held on the trigger, and shrinks back into the trigger on the dismiss spring when it closes, on the compositor and interruptible both ways. With reduced motion it cross-fades in and out, opacity only, in 200 ms or less. A fine primary pointer (a mouse) keeps its entrance and the theme's motion.

@vjeux
