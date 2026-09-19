---
'@astryxdesign/core': patch
---

[fix] Reject all `data:` URL schemes in Markdown parser's `isSafeUrl`, aligning parser behavior with its documented contract and the renderer's `DANGEROUS_URL_PATTERN` to prevent dangerous data URIs like SVG with embedded scripts from passing through AST link and image nodes. (#6323)

@ManoharPaturi
