---
'@astryxdesign/cli': patch
---

[fix] `astryx template --help` and `astryx layout expand --help` now explain how the path argument is read: a path ending in a source-file extension is the file to write, anything else is a directory that gets `page.tsx`, the block's file name, or `<Name>.tsx`. `layout expand` and `layout check` also document `-` for stdin and that `--file` wins over the argument, and `--overwrite` no longer mentions a prompt the CLI never shows.

@josephfarina
