---
'@astryxdesign/core': patch
---

[fix] Markdown image alt text shows character references and escapes as the characters they name

`![Fish &amp; chips](…)` gave the image the alt text `Fish &amp; chips`, so a screen reader announced "amp". Alt text now resolves character references and backslash escapes the same way body text does, for inline, standalone, and reference-style images; an escaped `&` and unknown names stay literal.

@cixzhang
