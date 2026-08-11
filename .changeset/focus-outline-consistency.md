---
'@astryxdesign/core': patch
---

[fix] Consolidate general interactive focus outlines onto one definition — 2px `--color-accent` at 3px offset, matching Design Conventions.

Most general controls had drifted to a 2px offset; Button, Calendar, Dialog and Pagination were the ones still on spec. Their value wins, so a focus ring on the drifted components (Link, TabList, Token, TreeList, SegmentedControl, TopNav items) now sits 1px further from its control.

Destructive buttons keep their error-colored ring, and `--button-focus-offset` is unchanged. Form and input focus treatments are out of scope.

@cixzhang
