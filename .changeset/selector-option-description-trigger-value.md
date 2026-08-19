---
'@astryxdesign/core': patch
---

[fix] Selector: `SelectorOptionData` gains `description`, and the closed trigger now shows the selected option instead of just its label. The two-line option row `SelectorOption` draws was unreachable from the `options` prop — the data type carried only `value/label/disabled/icon` — so consumers kept a side map of descriptions keyed by value and re-rendered the row through `renderOption`. `description` now sits on the option data and `DefaultOption` forwards it. On the trigger, the selected option's own `icon` renders in the closed state (`startIcon` still wins when set, so a pinned field icon never doubles up), which retires the app-side `startIcon={value === 'x' ? … : …}` mirroring of state the component already knows. The description deliberately stays out of the default trigger: the control's height is the `--size-element-*` token it promises, and a second line breaks that. `renderValue` is the opt-in — it draws the selection however the caller wants and relaxes the trigger's fixed height to a minimum, so a two-line value grows the control (32px → 58px at `md`) instead of being clipped. A string description ellipsizes on one line, so the growth is bounded at one line however long the text.

[feat] Item: new `layout` prop — `'stacked'` (default, unchanged) or `'inline'`, which keeps the description on the label's line with the description ellipsizing first. Every row built on `Item` gets it, `SelectorOption` included.

[fix] Selector: a `renderValue` trigger inside an `InputGroup` no longer spills through its own border. A group row is fixed-height by construction (`groupStyles.inGroup` sets `height:100%`), so relaxing the trigger to a minimum height did nothing there and a two-line value rendered a 40px box inside a 32px one, bleeding 4px past the border at every size. In a group the trigger keeps its size token and renders the value inline — `SelectorOption` picks the inline layout up from the trigger, so callers using it need no change. A hand-composed `renderValue` is still the caller's to fit: the trigger cannot re-lay-out arbitrary content.

@cixzhang
