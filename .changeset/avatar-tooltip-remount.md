---
'@astryxdesign/core': patch
---

[fix] Avatar: avoid remounting the avatar subtree when the name tooltip toggles — render the tooltip as a conditional sibling instead of forking the return so the avatar keeps its position in the React tree (and its image-load state) across tooltip changes.
@cixzhang
