---
'@astryxdesign/core': patch
---

[fix] DropdownMenu/MoreMenu: opening with a pointer no longer highlights the first item as if it were selected (#4477). Initial focus now follows the input modality: keyboard opens (Enter/Space/ArrowDown on the trigger) still focus the first enabled item per the APG menu-button pattern, while pointer opens focus the menu container itself so the first ArrowDown moves to item 1. Synthesized clicks (detail 0, e.g. screen reader activation) and programmatic controlled opens keep the first-item focus behavior. Covers data-driven items mode, compound mode, and MoreMenu, which share the open path.
@jiunshinn
