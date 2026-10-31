---
'@astryxdesign/core': patch
---

[fix] RadioList: a disabled radio stays reachable by keyboard and announces as disabled, with or without a `disabledMessage`. It renders `aria-disabled` instead of native `disabled`, refuses selection, runs no `onClick`, and submits no value. Arrow keys keep skipping an individually disabled option, and a focused disabled option shows the focus ring. A disabled group's radios render under the group's internal name instead of `htmlName`, since they submit nothing; this keeps two disabled groups that share an `htmlName` in different forms apart.

@cixzhang
