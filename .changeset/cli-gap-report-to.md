---
'@astryxdesign/cli': patch
---

[feat] `astryx gap-report --to <package>` sends a report to the issues URL of the loaded integration the person chose, under the same `--confirm-public` rule, instead of the default handlers. When loaded integrations name their own issues URLs, `--list-categories` and the receipt list every destination and tell the agent to ask the person where to file. The default route is unchanged.

@josephfarina
