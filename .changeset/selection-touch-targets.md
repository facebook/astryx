---
'@astryxdesign/core': patch
---

[feat] On a touch screen, a checkbox and a radio option are now as easy to hit as an iOS control, and nothing changes size: a standalone, labelled CheckboxInput and each RadioList option get an invisible hit area that reaches the theme's new `--size-touch-target` size token (44 px by default, Apple's control size) and stops at half the gap to each neighbour, so neighbouring targets never overlap. A theme can set `--size-touch-target` to change the reach. A label-hidden checkbox inside another component's row (a MultiSelector option, a table selection cell, a task item) keeps that row's target. With a mouse or trackpad nothing changes. The CheckboxInput `size` docs now give the real box sizes.

@vjeux
