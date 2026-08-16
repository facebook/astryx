---
'@astryxdesign/cli': minor
---

[feat] `astryx theme build` takes any number of theme files — `astryx theme build themes/*.ts` compiles them all in one process, so an app with several themes no longer hand-rolls a loop that re-enters the CLI once per theme. Outputs are byte-identical to the serial invocations; the run stops at the first failure and names the theme that failed. The CLI's Node floor (>=22.13) is now declared in `engines`, so a package manager can enforce it at install instead of the build failing later.
