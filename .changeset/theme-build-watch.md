---
'@astryxdesign/cli': patch
---

[feat] `astryx theme build --watch`: rebuild a theme automatically whenever the source file changes, until interrupted with Ctrl-C. Removes the manual re-run step (and the stale-CSS confusion that comes with forgetting it) from the theme-authoring loop. Each rebuild runs in a child process so a build error is contained and the watcher keeps running. Not supported with `--json`. (#3375)

@josephfarina
