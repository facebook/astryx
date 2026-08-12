---
'@astryxdesign/core': patch
---

[fix] Selector, MultiSelector: the `hasSearch` field is now part of the dropdown panel instead of a bordered input dropped into it. The panel is already a bordered, elevated surface, so the nested `TextInput` drew a box inside a box; the row now renders a leading magnifier, a borderless input, and the shared clear (✕) button, with a full-bleed divider between it and the options — the same shape the command palette already uses. Behavior, keyboard handling, and accessible names are unchanged; MultiSelector's search row additionally stays put while the options scroll under it. Themes can target the row as `astryx-selector-search` / `astryx-multi-selector-search`; anything that styled the dropdown search through `astryx-text-input` needs to move to those.

@cixzhang
