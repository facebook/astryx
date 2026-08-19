---
'@astryxdesign/core': patch
---

[fix] Selector: `SelectorOptionData` gains `description`, and the closed trigger now shows the selected option instead of just its label. The two-line option row `SelectorOption` draws was unreachable from the `options` prop — the data type carried only `value/label/disabled/icon` — so consumers kept a side map of descriptions keyed by value and re-rendered the row through `renderOption`. `description` now sits on the option data and `DefaultOption` forwards it. On the trigger, the selected option's own `icon` renders in the closed state (`startIcon` still wins when set, so a pinned field icon never doubles up), which retires the app-side `startIcon={value === 'x' ? … : …}` mirroring of state the component already knows. `renderValue` is the seam for drawing the selection yourself — the description included.

[feat] Item: new `layout` prop — `'stacked'` (default, unchanged) or `'inline'`, which keeps the description on the label's line with the description ellipsizing first. Every row built on `Item` gets it, `SelectorOption` included.

[fix] Selector: the trigger is a FIXED height off its `size` token in both value layouts, so it still lines up with the Buttons and inputs beside it. It previously swapped that height for a minimum whenever `renderValue` was passed — keyed on the prop being present, not on the content needing the room — so a one-line value measured 39px and a two-line one 58px at _every_ size, and the `size` prop stopped affecting the trigger at all. Inside an `InputGroup`, where `groupStyles.inGroup` pins the row, the relaxed height did nothing and the content bled 4px through its own border. Now `valueLayout` decides, explicitly: `inline` (the default) keeps the size token — 28/32/36 — and `stacked` gives the description its own line at 48/52/56, one element token plus one line of text, so the taller trigger stays on the 4px rhythm. A `SelectorOption` follows the trigger's layout and ellipsizes; hand-composed `renderValue` content is the caller's to fit. `stacked` is ignored inside an `InputGroup`.

@cixzhang
