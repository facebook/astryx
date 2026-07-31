---
'@astryxdesign/core': patch
---

[feat] Field/FieldStatus: add `astryx-input-status-icon` and `astryx-field-status-icon` theme targets on the field status glyph, so consumers can recolor, resize, and restyle it — per status — via `defineTheme` instead of a fragile descendant selector or raw CSS. `astryx-input-status-icon` sits on the on-field icon shared by all bordered inputs across the `attached` and `tooltip` status variants and reflects `data-size`/`data-status`; `astryx-field-status-icon` sits on the detached message box's leading icon and reflects `data-type`. Purely additive — default rendering is unchanged.

@freddymeta
