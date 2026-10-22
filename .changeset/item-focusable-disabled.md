---
'@astryxdesign/core': patch
---

[fix] A disabled Item (and ListItem) and a disabled Item swipe action stay focusable. Before, the row's button and swipe actions rendered the native `disabled` attribute and a disabled link row left the tab order, so keyboard and screen-reader users could not reach them. Now each exposes `aria-disabled="true"` and keeps the Tab stop it has when enabled, while click, Enter, Space, `onClick` and swipe activation stay blocked. A disabled link row renders a plain href-less anchor with the link role, so nothing navigates and a router link that needs a live `href` is never rendered. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR5). No API changes.

@cixzhang
