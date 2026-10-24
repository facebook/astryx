---
'@astryxdesign/core': patch
---

[feat] AppShell: under a finger (one touch model on every touch device), when the page scrolls (`height="auto"`, or `height="adaptive"` on a touch device), the pinned header looks like an iOS 26 bar. It paints no background of its own and draws no divider. Once the content has moved more than 10px under it, a veil of the header's colour fades in at its top on iOS's measured spring (0.29 s): strongest at the top, gone just below the header. It fades out (0.51 s) when the content comes back. A scroll the program drives (`scrollTo`, a status-bar tap) switches the veil at once instead: on iOS 26.2 a fade that starts on such a scroll makes WebKit drop the header's items for a frame or two. Under Reduce Motion the fades are the animator's 200 ms cross-fade. Where the browser supports `prefers-reduced-transparency` (Safari 26.2 does not yet), Reduce Transparency makes the veil an opaque band ending at the header's bottom edge. With a mouse nothing changes. The two springs are motion roles a theme can retune (`bars.scrollEdgeEffect.appear` and `.disappear`).

@vjeux
