---
'@astryxdesign/cli': minor
---

[breaking] The integration guide moved from `astryx docs cli-integrations` to `astryx docs cli/integrations`. (#6626)

The guide now lives in the CLI's docs tree, under `cli`. The old name is gone: `astryx docs cli-integrations` and `docs('cli-integrations')` fail with an unknown topic. Use `astryx docs cli/integrations`, including section reads such as `astryx docs cli/integrations components`. The docsite page stays at `/docs/cli-integrations`.

@josephfarina
