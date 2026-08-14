---
'@astryxdesign/core': patch
---

[fix] Layer: host context layers (HoverCard, Tooltip, Popover, Menu) in the nearest ancestor of the trigger that can hold them, rather than where they were rendered in the tree, and emit nothing for them in server markup. A hover card triggered from inline text used to be emitted inside the `<p>`, where the HTML parser reparents it out of the paragraph: the card opened empty and its content appeared in the page. A card inside a link tore the same way and put its own links inside the wrapping link's tab stop and click target, and an inline layer inherited the paragraph's font size and text alignment. Hosting near the trigger (not in `<body>`) keeps the theme cascade and the tab order, and `show()` now passes the trigger as the popover's invoker `source`
@cixzhang
