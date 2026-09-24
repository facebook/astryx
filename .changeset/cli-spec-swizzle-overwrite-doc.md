---
'@astryxdesign/cli': patch
---

[fix] The `astryx swizzle --overwrite` help and manifest entry no longer says it skips a prompt. The CLI never prompts. The entry now says that without `--overwrite`, existing files fail the command with `ERR_FILE_EXISTS` and nothing is written.

@josephfarina
