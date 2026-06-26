---
'@astryxdesign/core': patch
---

[feat] Add a prebuilt UMD bundle (`dist/astryx.umd.js`, global `Astryx`) plus `unpkg`/`jsdelivr` fields, so the library works directly from a CDN via a `<script>` tag with no bundler. React/ReactDOM stay as peer globals; the StyleX runtime is bundled in.

@cixzhang
