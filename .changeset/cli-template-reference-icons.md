---
'@astryxdesign/cli': patch
---

[experimental] Templates by meaning, through an official icon set. Bundled templates and blocks now import their icons from `@astryxdesign/icons-heroicons`, a new experimental, unpublished package built with `astryx experimental icon` (every Heroicons icon in outline, solid, and mini, mapped to every built-in icon definition). A project that does not opt in sees no change: `astryx template`, shown or copied, writes each of those imports as the upstream Heroicons import, exactly the file it wrote before, with no `icons` report. With `experimental.iconSet` set to `heroicons`, templates keep the set's imports; with another set, icons map by definition as before, and an icon left unmapped is written as its upstream import. The new `experimental.templateIcons: true` in astryx.config, with no `experimental.iconSet`, swaps each declared icon for Core's built-in icon of that meaning, or a neutral placeholder, and the `icons` report carries the swapped icons (`core`) and a note on installing a set. The table-filter toolbar block now draws Heroicons from the set instead of Lucide; templates whose icons Heroicons cannot all draw, and the theme showcase, keep Lucide.

@josephfarina
