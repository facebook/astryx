---
'@astryxdesign/cli': minor
---

[breaking] The integration guide moved from `astryx docs cli-integrations` to `astryx docs cli/integrations`, and became a set of short guides. (#6626)

The guides live in the CLI's docs tree, under `cli`: `astryx docs cli/integrations` lists them by task (start, contribute, ship, and help), and each reads on its own, such as `astryx docs cli/integrations/quick-start`. The old name is gone: `astryx docs cli-integrations` and `docs('cli-integrations')` fail with an unknown topic. On the docsite, `/docs/cli-integrations` redirects to the first guide.

@josephfarina
