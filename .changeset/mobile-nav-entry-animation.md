---
'@astryxdesign/core': patch
---

[fix] MobileNav: the drawer now slides in when it opens, instead of only sliding out when it closes. Two things were needed, and each is useless without the other. First, the dialog is `display: none` while closed, so the drawer's first rendered frame already holds the on-screen transform and a transition has no before-change value to run from — `@starting-style` supplies it, for the drawer's transform and for the `::backdrop`'s opacity. Second, the dialog clipped the off-screen drawer with `overflow: hidden`, which makes it a scroll container; a scroll container in the top layer whose subtree holds another scroller (the drawer's content area) does not paint a `@starting-style` entry transition for its descendants in Chromium — the transition ticks in the CSSOM while every painted frame shows the end value. `overflow: clip` clips identically without creating a scroll container. The drawer now slides in from its own edge (mirrored under RTL) and the scrim fades up, both on `--duration-medium` and both collapsing under `prefers-reduced-motion`, exactly as the close already did (#5218).

@imdreamrunner
