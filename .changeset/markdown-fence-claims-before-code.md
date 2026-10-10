---
'@astryxdesign/core': patch
---

[fix] `Markdown` renders a fence that a `createMarkdownFenceTransform` plugin claims through that plugin even when `components.code` is supplied. A host that drew its own code blocks lost every semantic fence, so a diagram or chart fence showed as code. `components.code` now renders every fence no plugin claims, and stays the fallback when a claimed fence's renderer declines, throws, or suspends. Hosts with only one of the two render as before.

@cixzhang
