---
'@astryxdesign/cli': patch
---

[refactor] CLI: upgrade reorganized into api/upgrade leaf shape — the flat pipeline is split into a dispatcher+barrel (`upgrade.mjs`), a shared `_adapter.mjs` (version detection + agent-docs refresh + codemod selection/execution machinery), and `list`/`status`/`run` leaves (`upgrade.list` | `upgrade.status` | `upgrade.run`). Pure reorg: the `./api` barrel + CLI consumer are unchanged, and both the human output and `--json` envelopes are byte-identical.
@josephfarina
