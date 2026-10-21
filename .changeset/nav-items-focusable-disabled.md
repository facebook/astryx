---
'@astryxdesign/core': patch
---

[fix] Disabled Link, ClickableCard, Item and Item swipe actions, and the buttons of a disabled Token, stay focusable. Before, they rendered the native `disabled` attribute or `tabIndex={-1}`, so keyboard and screen-reader users could not reach them. Now each disabled control exposes `aria-disabled="true"` and keeps the Tab stop it has when enabled, while activation by click, Enter or Space, `onClick`, removal and navigation stay blocked; a disabled Link or Item link keeps no live destination and is exposed with the link role. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR5). No API changes.

@cixzhang
