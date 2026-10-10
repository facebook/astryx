---
'@astryxdesign/core': patch
---

[fix] Kbd: use primary text color token to meet WCAG AA contrast over neutral keycaps (#7100)

The default `<kbd>` text color has been updated to `--color-text-primary`, ensuring visible key glyphs exceed the 4.5:1 WCAG AA contrast ratio against the `--color-neutral` keycap background across all light and dark themes.

@Geervan
