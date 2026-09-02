---
'@astryxdesign/core': patch
---

[fix] ChatComposer: add a keyboard-only focus ring around the composer body when its editor receives focus

The ring uses the shared theme focus tokens and does not appear for pointer focus or when an internal action button owns focus.

@rubyycheung
