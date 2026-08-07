---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> --skeleton` and `--show` no longer advertise components that `astryx component <Name>` cannot resolve. The list was scraped from JSX tags in the template source with no registry check, so local helpers (`TimelineSection`), third-party tags (recharts `Line`/`Bar`), type-only names, and undocumented exports leaked into the skeleton, breaking the "query every proposed component before importing" workflow.

The template layer now filters against `listResolvableComponentNames()`, the exact-resolution index from the component discovery subsystem. It is built once via the canonical `loadDocs` loader and mirrors `astryx component`: core components (+ configured integrations and back-compat `astryx.docs` packages) and the parent-doc subcomponents referenced by a component doc's `components:` object array (so `StackItem`, `ResizeHandle`, etc. stay advertising). The old regex doc-scan that shredded object-array subcomponent entries is gone, and no fuzzy suffix rewriting (`StackItem` -> `Stack`) is applied anymore. A name is advertised iff it resolves exactly. `componentsUsed` fields in `template.list` entries are author-declared metadata and are intentionally unchanged. (#4677)
@MeGaurav4
