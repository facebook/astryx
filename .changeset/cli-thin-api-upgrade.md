---
'@astryxdesign/cli': patch
---

[feat] CLI: `upgrade` is now fully scriptable through the `./api` barrel — the version-to-version pipeline (codemods + agent-docs refresh) lives in `api/upgrade` and returns a typed receipt (`upgrade.list` | `upgrade.status` | `upgrade.run`), with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `upgrade()` stays silent while the CLI output and `--json` envelopes are unchanged for existing usage.
@josephfarina
