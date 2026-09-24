---
'@astryxdesign/cli': patch
---

[fix] `astryx theme add` now copies every file a theme catalog lists byte for byte, so a theme that ships a font or an image arrives intact. Before, it decoded each file as text, which corrupted any file that was not UTF-8.

@josephfarina
