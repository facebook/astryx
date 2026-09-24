---
'@astryxdesign/cli': patch
---

[fix] `"astryx": {"inheritDebug": false}` in package.json now also refuses the `debug` handler of an autolinked integration in a project that has no `astryx.config`. The setting used to be read only beside a config file, so without one those handlers still received every run.

@josephfarina
