---
'@astryxdesign/cli': patch
---

[fix] `astryx template --help` now explains how the path argument is read: a path ending in a source-file extension is the file to write, and anything else is a directory that gets `page.tsx` or the block's file name. `--overwrite` no longer mentions a prompt the CLI never shows. (#6571)

@josephfarina
