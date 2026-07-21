---
'@astryxdesign/cli': patch
---

[docs] Add a `cli-integrations` CLI docs topic (`astryx docs cli-integrations`) so the integration-authoring guide (originally written by @ejhammond) is discoverable through the CLI and docsite instead of an unreferenced markdown file. Rewrite the CLI README's Configuration section to match the current strict config schema (`integrations`, `issuesUrl`, `hooks.postCodemod`, `experimental.xle`) and reframe the Integrations section around the two-file API.

@ejhammond
@josephfarina
