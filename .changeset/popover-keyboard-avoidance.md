---
'@astryxdesign/core': patch
---

[fix] A Popover that would run under the software keyboard shrinks to stay 10 px above it, keeping its top on its trigger, and its content scrolls in the shorter box; it grows back when the keyboard goes down, as a popover on iOS does. Before, the keyboard covered the bottom of a tall popover and whatever sat there, a Save button, could not be reached until the keyboard was dismissed. A popover clear of the keyboard is left as it is.

@vjeux
