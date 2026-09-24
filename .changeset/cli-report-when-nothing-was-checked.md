---
'@astryxdesign/cli': patch
---

[fix] Say when a command did nothing: `upgrade` reports `sourcePathFound`, the integration checks report `validated`.

Two commands could legitimately do nothing and produce an envelope identical to
a clean success. Both now carry the fact in a field of their own response
instead of only in human text.

`astryx upgrade` defaults `--path` to `./src`. A project laid out as `app/` (or
a typo) skipped every code codemod and still reported exit 0, `filesChanged: 0`,
`errors: []` and "Upgrade complete". The only warning was a log line `--json`
suppresses by design. `upgrade.run` now carries `sourcePathFound`, and the
human completion line names the directory it did not find.

`astryx doctor integration validate|components|docs|templates` returned
`{name: null, version: null, issues: []}` and exit 0 when no integration
manifest was found — the same shape as a validated, healthy integration. All
four envelopes now carry `validated`, false only when nothing was inspected.

@josephfarina
