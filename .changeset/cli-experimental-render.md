---
'@astryxdesign/cli': patch
---

[experimental] New command `astryx experimental render <page>`: renders a page with your installed Astryx components to ONE self-contained HTML file. The file inlines only the Core CSS rules the page uses plus the page's own StyleX styles and local images, runs no script, loads nothing from the network, follows light and dark mode, and carries the page's source. `astryx experimental render --reverse <file.html>` writes that source back byte for byte, rebuilds a page from Astryx markup when the source was removed, and refuses other HTML. Warnings flag what may not look as meant, such as a `ListItem` given children instead of `label`. Experimental commands live under `astryx experimental`, are marked `[experimental]` in help and the manifest, and may change or be removed in any patch release. Guide: `astryx docs cli/experimental/render-pages`.

@josephfarina
