---
'@astryxdesign/cli': patch
---

[feat] CLI: `init` is now fully scriptable through the `./api` barrel — the non-interactive installer (agent-docs cheat sheet, starter template, `--remove-agents`) lives in `api/init` and returns a typed receipt (`init.run` | `init.remove`), with the CLI reduced to a thin parse → API call → render wrapper. Human output is emitted through an injectable logger, so a scripted `init()` stays silent while the CLI output is byte-identical for existing usage.
@josephfarina
