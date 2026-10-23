---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` from 0.1.x no longer renames `color="active"` or `labelSpacing="default"` on a `Text`, `Heading`, `Link`, `Timestamp` or `Switch` from another package, such as React Native's `Text` or Headless UI's `Switch`. The two renames now edit only JSX that resolves to an Astryx import and the Storybook `args` and `argTypes` of a meta or story whose `component` is one. Any other matching object is left unchanged. (#7990)

@ejhammond
