---
'@astryxdesign/cli': patch
---

Every CLI artifact response now names its source package. Component detail
projections (props, blocks, showcase, source), docs reads (topic, index,
section), docs-tree node children, build-kit recommendations, and upgrade
codemod lists all carry a `package` field identifying the npm package that
owns the artifact. Props uses `meta.package` (array data). Verbatim-piped
source and showcase bodies are exempt.
