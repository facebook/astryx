---
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/cli': patch
---

[fix] Stone, Y2K, and Gothic set `CodeBlock`'s diff row slots in their own syntax palettes, so a reader of a diff on those themes gets added and removed rows whose code, line numbers, and `+`/`-` glyphs stay readable: every syntax token keeps at least 4.5:1 on the tinted rows in Stone (light and dark) and Y2K (light and dark), and in Gothic the rows take a deep green and a deep red at the background's own luminance, so every token keeps the contrast it has on the plain background. Line numbers and glyphs on changed rows use each theme's own green and red. The CLI's bundled copies of the three themes (`astryx theme eject`) carry the same palettes.

@cixzhang
