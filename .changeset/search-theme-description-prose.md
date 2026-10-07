---
'@astryxdesign/cli': patch
---

[fix] Search ranks a theme's description as prose, not as keywords
@cixzhang

A word a theme shares with your query only through its description, such as `minimal`, `focus` or `content`, now ranks the theme like any other description instead of like a declared keyword, so it no longer lands above the components, hooks and docs that declare that word. A theme still comes first for its own slug or display name: `astryx search neutral` finds the Neutral theme first.
