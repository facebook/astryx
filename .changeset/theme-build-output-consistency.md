---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` now derives every output file (.css/.js/.d.ts) from the theme name so they share one naming scheme, shows import paths as bare `./<name>` specifiers (instead of a cwd-rooted `./src/...` path that was wrong when your file already lives under src/), and no longer warns about the `variant` prop on `card`
@rubyycheung
