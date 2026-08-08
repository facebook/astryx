---
'@astryxdesign/core': patch
---

[fix] Table tree + groupedRows plugins: no longer set row-level tree ARIA on `<tr>` elements — aria-expanded (both plugins) and aria-level (tree plugin) are only valid on rows inside a treegrid (axe aria-conditional-attr), and Astryx Table is a native table. Expansion state stays announced by the expander/chevron buttons, which already carry aria-expanded (same pattern as the rowExpansion plugin). Note the trade-off: tree depth is now conveyed visually by indentation only — the removed aria-level was invalid in this context (and unreliably announced because of it), but assistive technology currently gets no programmatic depth cue; announcing depth (for example via the expander's accessible name) is a tracked follow-up. If you queried `tr[aria-expanded]` or `tr[aria-level]` in tests, target the button or the row's content instead.
@AKnassa
