---
'@astryxdesign/core': patch
---

[feat] On a touch screen, a checkbox and a radio option are now as easy to hit as an iOS control, and nothing changes size: a standalone, labelled CheckboxInput and each RadioList option get an invisible hit area that reaches the new `--size-touch-target` size token (44 px, Apple's control size; a smaller value never lowers it) and stops at half the gap to each neighbour, so neighbouring targets never overlap. Between close neighbours a target stays smaller: a middle RadioList option reaches 32 px at the default 8 px gap. Under a finger a RadioListItem row's `::after` becomes its hit layer, so decorate a row with a child rather than its `::after`. A label-hidden checkbox inside another component's row (a MultiSelector option, a table selection cell, a task item) keeps that row's target. With a mouse or trackpad nothing changes. The CheckboxInput `size` docs now give the real box sizes.

@vjeux
