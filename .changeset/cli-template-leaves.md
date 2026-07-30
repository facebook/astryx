---
'@astryxdesign/cli': patch
---

[refactor] CLI: template reorganized into api/template leaf shape (shared helpers preserved on the barrel). Pure reorg — `--json` and human output stay byte-identical: shared discovery/IO moved to `api/template/_adapter.mjs`, the command modes split into `list`/`show`/`skeleton`/`copy` leaves, and `template.mjs` becomes a dispatcher + barrel that re-exports every previously-exported symbol (template, discoverTemplates, discoverAll, discoverAllWithErrors, discoverIntegrationTemplatesForOne, findShowcase, findRelatedBlocks, stripTemplateAssetRefs, listTemplates, extractComponents, and the DiscoveredTemplate/TemplateDiscoveryError types) so component/layout/search/init/discover/validate-integration and lib/project keep resolving `api/template/template.mjs` unchanged.
@josephfarina
