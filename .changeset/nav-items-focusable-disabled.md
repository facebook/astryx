---
'@astryxdesign/core': patch
---

[fix] Disabled Link and ClickableCard, and the buttons of a disabled Token, stay focusable. Before, they rendered the native `disabled` attribute or `tabIndex={-1}`, so keyboard and screen-reader users could not reach them. Now each disabled control exposes `aria-disabled="true"` and keeps the Tab stop it has when enabled, while activation by click, Enter or Space, `onClick`, removal and navigation stay blocked; a disabled Link keeps no live destination and is exposed with the link role. A `Popover` no longer opens from a wrapped or `anchorRef` trigger marked `aria-disabled="true"` (for example a disabled `Button` with a `tooltip`), including for a click dispatched straight on the trigger; before, such a click opened it. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR5). No API changes.

@cixzhang
