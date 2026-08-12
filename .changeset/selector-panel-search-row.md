---
'@astryxdesign/core': patch
---

[fix] Selector, MultiSelector: the dropdown panel's search field is now part of the panel instead of a bordered input dropped into it. The panel is already a bordered, elevated surface, so the nested `TextInput` drew a box inside a box; the row now renders a leading magnifier, a borderless input, and the shared clear (✕) button, with a full-bleed divider between it and the options — the same shape the command palette already uses. Focus is shown as an inset ring on the row, rounded to the panel's own corners. Section titles move from labeled dividers to plain secondary headings, matching DropdownMenu and CommandPaletteGroup, and MultiSelector no longer draws a rule under select-all. Behavior, keyboard handling, and accessible names are unchanged; MultiSelector's search row additionally stays put while the options scroll under it. New theme targets: `astryx-selector-search`, `astryx-selector-section-heading`, `astryx-multi-selector-search`, `astryx-multi-selector-section-heading`; anything that styled the dropdown search through `astryx-text-input` needs to move to those.

@cixzhang
