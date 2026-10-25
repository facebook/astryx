---
'@astryxdesign/core': patch
---

[fix] On a touch screen, a checkbox and a radio option are now as easy to hit as an iOS control: their target is the theme's new `--size-touch-target` size token (44 px by default, Apple's control size), so a dense theme can lower it. A standalone, labelled CheckboxInput's row is at least that tall and its target at least that square, centered on the 20 or 24 px box; the box and label keep their size. A label-hidden checkbox inside another component's row (a MultiSelector option, a table selection cell, a task item) keeps that row's height and its 24 px target. Each RadioList option's row is at least that tall; in a vertical list each row takes half the list's gap above and below as its own target, so the rows touch and grow only by what the gap does not already give them. With a mouse or trackpad nothing changes. The CheckboxInput `size` docs now give the real box sizes.

@vjeux
