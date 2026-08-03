---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[docs] Surface the React 19 peer-dependency requirement everywhere a user would look for it (root README, core README, docsite hero, and the CLI getting-started guide), and add a sync test that keeps those surfaces naming the same React major as the core peer range.
@AKnassa
