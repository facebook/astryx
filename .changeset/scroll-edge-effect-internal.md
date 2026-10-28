---
'@astryxdesign/core': patch
---

[chore] Internal: the scroll edge effect moves to core's internal motion modules and takes its springs, the veil's edge and colour, and the inset of a bar overlaying a scroll container from its caller, so Lab's NavigationStack uses it too; a scroll container's switch is measured from its padding edge in every engine. AppShell's touch bar is unchanged. Not exported from the package entry point.

@vjeux
