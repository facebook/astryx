---
'@astryxdesign/core': patch
---

[fix] Toast fallback viewport resolves the app's theme mode instead of OS preference (#3743)

The fallback mounts via createRoot() on a disconnected tree, so Toast's useTheme() couldn't see ThemeContext and fell back to prefers-color-scheme — when that disagreed with `<Theme mode>`, the toast's inverted-surface text/icon could compute to the same color as its own background. useToast's fallback container now mirrors `<html data-theme>` and `data-astryx-theme` directly (kept live via MutationObserver), and useTheme() itself falls back to reading `<html data-theme>` before assuming OS preference when no ThemeContext ancestor is reachable — the mechanism that actually resolves Toast's JS-computed mode for disconnected trees like this one.
@let-sunny
