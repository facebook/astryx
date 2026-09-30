---
'@astryxdesign/cli': patch
---

[fix] The CLI reference now matches what the commands do. Every `--help` ends with the command's examples and a `More:` line that names its full docs page. Function docs show each parameter's default, mark required parameters, list the error codes each function throws, and use examples that run. The response-type list adds `help`, `version`, and `upgrade.registry`, and `astryx manifest` now lists `upgrade.registry` for `upgrade`. The `--zh`, `--dense`, `--lang`, and `--detail` descriptions name the commands they change, and command summaries say when to use each command. When `astryx template` refuses to overwrite a file, it now says to re-run with `--overwrite` (or `-f`). The `upgrade` command page (`astryx docs cli/commands/upgrade`) now explains which files codemods never edit, what happens when one of them needs a change, and how to regenerate it.

@josephfarina
