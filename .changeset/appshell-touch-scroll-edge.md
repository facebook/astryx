---
'@astryxdesign/core': patch
---

[feat] AppShell: on a touch screen whose page scrolls (`height="auto"`, or `height="adaptive"` on a touch device), the pinned header looks like an iOS 26 bar. It paints no background of its own and draws no divider. Once the content has moved more than 10px under it, a veil of the header's colour fades in at its top on iOS's measured spring (0.29 s): strongest at the top, gone just below the header. It fades out (0.51 s) when the content comes back. Under Reduce Transparency the veil is an opaque band ending at the header's bottom edge. With a mouse nothing changes.

@vjeux
