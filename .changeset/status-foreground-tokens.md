---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
'@astryxdesign/richtext': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[feature] Add a complete public semantic status-color model: `info` tokens for informational fills, `on-*-muted` pairs for pale surfaces, and `status-foreground-*` roles for text, icons, and boundaries on plain surfaces. Core status components now select the appropriate role from their surface, and every first-party theme provides matching values.

@rubyycheung
