---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` from 0.1.x no longer renames `color="active"` or `labelSpacing="default"` on a `Text`, `Heading`, `Link`, `Timestamp` or `Switch` from another package, such as React Native's `Text` or Headless UI's `Switch`. The two renames now edit only components imported from Astryx, and their object and Storybook `argTypes` edits run only in files that import one from Astryx.

@ejhammond
