---
'@astryxdesign/cli': patch
---

[fix] template: inline full demo-image URLs in the Avatar blocks and theme-showcase page so scaffolding strips them to a clean placeholder. Templates that stored only the CDN base in a `const` and appended the filename via interpolation (`` `${CDN}/File.png` ``) previously scaffolded a malformed `src` — the placeholder data URI with the filename glued onto the end — plus a dead `const CDN = 'data:…'`. (#4027)

@imdreamrunner
