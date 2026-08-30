---
'@astryxdesign/core': patch
---

[fix] Selector: collapse the mark column when the indicator renders nothing, and expose a `selector-list` theme target on the scrolling listbox.

The default check indicator returns `null` when unchecked, but the wrapping column still reserved space — themes that need edge-to-edge option content had to work around it with structural CSS. The column now carries `:empty { display: none }` so it self-collapses without affecting indicators that draw in both states (e.g. a radio replacement).

The new `selector-list` target lets a theme restyle the listbox padding directly via `defineTheme`, removing the need for `[role="listbox"]` structural selectors.

@athz
