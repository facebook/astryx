---
'@astryxdesign/cli': patch
---

[fix] A doc link to a component, page, or block (`{@link component:AcmeButton}`, `{@link @astryxdesign/core:component:Button}`, `{@link block:acme-card}`) now resolves, and reads as the command that opens it: `astryx component <Name>` or `astryx template <id> --type <page|block>`, with `--package` for anything not from Core. Before, every such link printed as written, and `astryx doctor` and `doctor integration docs` warned that it named no doc, for Core's components as for a package's own. A link that names no component or template still warns, and its hint now searches components or templates instead of topics. A resolved link's `route` is null for these kinds, which no `astryx docs` route opens.

@josephfarina
