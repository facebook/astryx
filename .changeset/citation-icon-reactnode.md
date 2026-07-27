---
'@astryxdesign/core': patch
---

[feat] Citation: `CitationSource.icon` now accepts a `ReactNode` (e.g. an Astryx `<Icon>`, an SVG, or a custom element) in addition to an image URL string, and a new `CitationSource.src` field holds a favicon/logo image URL (mirroring `Avatar`/`Thumbnail`). Additive and non-breaking: a string `icon` still renders as the favicon `<img>`, so existing callers are unaffected. When both a node `icon` and `src` are set, the node wins. The icon stays decorative — the accessible name still comes solely from the citation's `aria-label`.

@freddymeta
