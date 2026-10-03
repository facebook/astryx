---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration docs` fails when a namespace doc or a placement fails, as its help says.

Such a failure hides the doc from the docs tree, so it now exits 1 with an `invalid_doc_graph` error instead of a warning. A link that names no doc still only warns, since it prints as written. `doctor integration docs` and `doctor integration components` also no longer print an `[ok]` line after a check that failed.

A mistyped subcommand under `doctor` now fails and lists the subcommands the group has: `astryx doctor integrations` used to run the project checks, and `astryx doctor integration bogus` exited 0 in text though it exited 1 with `--json`.

@josephfarina
