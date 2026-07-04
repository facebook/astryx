---
'@astryxdesign/core': patch
---

[fix] Kbd: the component is no longer entirely `aria-hidden`. It now exposes a spoken accessible name (e.g. "Command + K") built from screen-reader-friendly key labels, while the visual glyphs (⌘, ⇧, ↵, …) are hidden from assistive tech. Previously any shortcut communicated only via `Kbd` — including CommandPalette's footer hints — was invisible to screen-reader users (#3343).
@cixzhang
