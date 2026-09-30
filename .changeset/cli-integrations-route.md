---
'@astryxdesign/cli': patch
---

[feat] The integration guide moved from `astryx docs cli-integrations` to `astryx docs cli/integrations`, and became a set of short guides. (#6626)

Documentation names and routes are mutable catalog data under `spec:AST-017/FR45`, so the move is nonbreaking and needs no compatibility alias. The guides live in the CLI's docs tree, under `cli`: `astryx docs cli/integrations` lists them by task (start, contribute, ship, and help), and each reads on its own, such as `astryx docs cli/integrations/quick-start`. The old name no longer resolves. On the docsite, `/docs/cli-integrations` redirects to the first guide.

@josephfarina
