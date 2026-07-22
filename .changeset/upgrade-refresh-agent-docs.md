---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` now keeps the managed agent-docs block honest after a version bump (#4168, #4169). One detection pass audits every managed `<!-- ASTRYX:START -->` block — the canonical agent-doc paths plus a root-level marker scan for custom `--agent-docs-path` targets — against what the installed version generates today:

- `--apply` rewrites stale blocks in place for the installed version, touching only the content between the markers; legacy `<!-- XDS:START -->` blocks migrate to the current markers.
- Dry-run reports each stale block as a pending change alongside the codemods (`Agent docs block in AGENTS.md is at v0.1.2 (installed: v0.1.7)`) instead of writing during a dry run, which it previously did.
- The pass also runs on the early "already up to date" and "no codemods available" returns, so `upgrade` never reports that nothing needs to change while the block is stale.
- Never-initialized nudge: core installed but no managed block anywhere and no `astryx.config` prints "No agent docs found — run `astryx init` …".
- `--json` status envelopes and the upgrade receipt carry a structured `agentDocs` result (`installedVersion`, `refreshed`, `stale`, `missing`).

@jiunshinn
