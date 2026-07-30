---
'@astryxdesign/core': patch
---

[fix] RTL: migrate physical `left`/`right` CSS properties to their logical equivalents so components mirror correctly under `dir="rtl"`. This is the Phase 2 mechanical, one-to-one follow-up to the RTL direction API — a no-op in the default LTR direction with no visual change.

- `textAlign: 'left' | 'right'` → `'start' | 'end'` (Selector, Typeahead, Chat trigger menu, DropdownMenu, CommandPalette, NavMenu items).
- `borderLeft*`/`borderRight*` → `borderInlineStart*`/`borderInlineEnd*`, kept as separate start/end declarations (Banner, Table cell/header dividers, DateRangeInput preset sidebar).
- Static `left`/`right` positioning → `insetInlineStart`/`insetInlineEnd` for full-bleed overlays and single-side offsets (Button spinner overlay, Chat dock/blur/placeholder, Field sr-only label, Lightbox close/nav/counter buttons, TabList indicators, Thumbnail remove slot, CodeBlock copy button).
- Inline `marginLeft` indentation → `marginInlineStart` (TreeList rows).

Behavioral/computed positioning (Slider, Resizable, floating layers, anchor-positioned popovers, transform-based centering) and directional radii are intentionally left for later phases.

@nynexman4464
