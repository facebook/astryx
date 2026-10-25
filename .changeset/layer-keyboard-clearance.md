---
'@astryxdesign/core': patch
---

[fix] Where the browser lets Astryx measure the software keyboard (Safari on iOS; Chrome for Android reports no keyboard), an anchored layer (a Popover, a menu, a Selector's list) that would run under it now keeps its top and shrinks to end 10 px above the keyboard, its content scrolling, and grows back when the keyboard goes down; before, the keyboard covered its lower part and a button there could not be reached. A layer clear of the keyboard, or placed above its trigger, does not change.

@vjeux
