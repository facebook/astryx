---
'@astryxdesign/core': patch
---

[fix] Slider: the track no longer resizes while dragging with `valueDisplay="text"` — the value label reserves the width of the widest formatted value (tabular numerals included), so the thumb stays put under the pointer instead of shifting as the label grows and shrinks. Decimal steps also snap to clean values now: stepping from 0.2 by 0.1 emits 0.3 — not 0.30000000000000004 — in the visible label, `aria-valuenow`, and `onChange`.
@AKnassa
