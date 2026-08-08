---
'@astryxdesign/core': patch
---

[fix] MobileNav: return focus to the element that opened the drawer when it closes. The drawer relied entirely on the browser's implicit `<dialog>` focus restore, which was reported failing in Safari 26.5.2 — `document.activeElement` became `<body>` after close, stranding keyboard and screen-reader users at the top of the document. MobileNav now captures the opener before `showModal()` moves focus into the top layer and restores it on close, matching what `Dialog` already does. The restore also covers the AppShell path, where the drawer is torn down by an `<Activity>` switching to `mode="hidden"` rather than by the close branch re-running. No API change. Focus is left untouched when there was no real opener (`activeElement` was `<body>`) or when the opener has since left the DOM. The captured opener is also now what `side="auto"` measures, so re-rendering an open drawer with a different `side` no longer resolves the side from an element inside the drawer. (#3343)

@AKnassa
