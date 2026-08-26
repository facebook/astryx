---
'@astryxdesign/core': patch
---

[fix] SideNav: collapsing a resizable SideNav with `resizable.autoSaveId` no longer persists a width of 0, which made the nav restore as an invisible zero-width panel after a reload. Persisted entries now store `{size, isCollapsed}` under the same key, so a reload restores the collapsed icon rail and expanding returns to the previously saved width. Legacy entries still load: a plain `0` (written by the old collapse path) restores as collapsed, so already-affected users recover without clearing localStorage, and plain width entries keep their width without overriding `defaultIsCollapsed`. `useResizable` gains an `initialIsCollapsed` config so a component that owns collapse state (like SideNav) can seed the hook and the two can never disagree at mount. Rolling back: an older `@astryxdesign/core` reading a new-format entry ignores it and falls back to the default width and the app's configured collapse default — the saved width and collapse state are silently lost, but the nav stays usable, and the old version's next write returns the entry to the legacy number format. Note for SSR apps: restoring a collapsed session changes the first client render, which React reports as a recoverable hydration mismatch (the same class as the existing persisted-width mismatch).

@AKnassa
