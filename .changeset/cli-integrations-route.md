---
'@astryxdesign/cli': patch
---

[feat] The integration guide moved from `astryx docs cli-integrations` to `astryx docs cli/integrations`. (#6626)

Documentation names and routes are mutable catalog data under `spec:AST-017/FR45`, so the move is nonbreaking and needs no compatibility alias. The guide now lives in the CLI's docs tree, under `cli`. Use `astryx docs cli/integrations`, including section reads such as `astryx docs cli/integrations components`. The old name no longer resolves. The docsite page stays at `/docs/cli-integrations`.

@josephfarina
