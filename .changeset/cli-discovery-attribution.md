---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] Make the CLI discoverable to AI agents, and record how projects find it.

@joeyfarina

- **Discovery:** `@astryxdesign/core`'s README now leads with an AI-agent callout
  pointing to `npx astryx init --via=readme`. In an isolated cold-start test
  (agents dropped into a fresh install with no prior context), the README callout
  drove agents to run `init` — installing the `AGENTS.md` component index — in 4/5
  runs vs 0/5 for a bare install, matching the `AGENTS.md` ceiling. A first-run
  nudge alone scored 0/5 (it can only convert once the CLI is already known).
- **Attribution:** `astryx` now records — on any command, at most once per CLI
  version — how and when a project started using the CLI (`via` / invoker /
  install method / versions). Local-only (`.astryx/attribution.jsonl`), no
  telemetry. Channels without a CLI flag can self-tag via the `ASTRYX_VIA` env var.
