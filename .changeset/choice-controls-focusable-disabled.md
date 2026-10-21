---
'@astryxdesign/core': patch
---

[fix] Disabled CheckboxInput, CheckboxList items, RadioList items, Switch, Slider and FileInput stay focusable. Before, they rendered the native `disabled` attribute unless a `disabledMessage` was set, so keyboard and screen-reader users could not reach them. Now every disabled control exposes `aria-disabled="true"` and keeps the Tab stop it has when enabled, while toggling, selecting, dragging, opening the file picker and any `onClick` stay blocked, and its value is still left out of form submission. A focused disabled checkbox, radio or slider thumb shows the keyboard focus ring. This meets the focusable-disabled requirement in spec:AST-085 (FR1–FR3, FR6). No API changes.

@cixzhang
