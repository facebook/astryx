---
'@astryxdesign/core': patch
---

[feat] TreeList: add a `variant` prop (`'lineGuides' | 'noGuides'`, default `'lineGuides'`) to select the base hierarchy guide-line look. `noGuides` hides the connector lines while keeping indentation intact. Orthogonal to `density` (spacing); the guides stay themeable via the `astryx-tree-list-guide` target. Non-breaking — omitting the prop renders exactly as before.

@cixzhang
