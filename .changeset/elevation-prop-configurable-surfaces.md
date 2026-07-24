---
'@astryxdesign/core': patch
---

[feat] Add an `elevation` prop to configurable surfaces — Card, ClickableCard, SelectableCard, Button, IconButton, ButtonGroup, and Banner take the full `'none' | 'low' | 'med' | 'high'` scale; ChatComposer takes `'none' | 'low'`. Defaults preserve today's appearance (`none` everywhere except ChatComposer's `low`), so nothing changes unless you opt in. (#4146)

@kentonquatman
