---
'@astryxdesign/cli': patch
---

[docs] Demonstrate a themed icon in the no-build CDN starter and guard every documented Astryx esm.sh import against bundling another React copy.

Repository tests scan tracked Markdown, HTML, and module files for Astryx esm.sh URLs, while the browser smoke verifies that the generated page fetches exactly one React implementation module.

@ejhammond
