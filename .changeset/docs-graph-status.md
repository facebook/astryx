---
'@astryxdesign/cli': patch
---

[fix] `astryx docs authoring` now says which docs-graph features are not built yet: the `placement`, `aliases` and `audience` fields, the workflow, collection and reference blocks, namespace docs, and the artifact, doc and instance identities. It had described them as working, but a topic that uses them fails to load. A namespace doc in an integration's docs directory now fails with a message that names it, instead of reporting missing topic fields. (#6492)

@josephfarina
