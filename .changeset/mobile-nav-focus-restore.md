---
'@astryxdesign/core': patch
---

[fix] MobileNav: return focus to the element that opened the drawer when it closes. The drawer relied entirely on the browser's implicit `<dialog>` focus restore, which was reported failing in Safari 26.5.2: `document.activeElement` became `<body>` after close, stranding keyboard and screen-reader users at the top of the document. MobileNav now captures the opener before `showModal()` moves focus into the top layer and hands it back as soon as the native dialog has closed, matching what `Dialog` already does. The close is deferred until the slide-out has played, so the restore waits for it too; until then the rest of the document is inert and an earlier `focus()` would be silently dropped. The restore also covers the AppShell path, where the drawer is torn down by an `<Activity>` switching to `mode="hidden"` rather than by the close branch re-running. No API change. Focus is left untouched when there was no real opener (`activeElement` was `<body>`), when the opener has since left the DOM, or when the drawer is reopened before its pending close runs. (#3343)

@AKnassa
