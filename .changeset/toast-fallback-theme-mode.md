---
'@astryxdesign/core': patch
---

[fix] Toast fallback viewport resolves the app's theme mode instead of OS preference

The fallback mounts via createRoot() on a disconnected tree, so Toast's useTheme() couldn't see ThemeContext and fell back to prefers-color-scheme — when that disagreed with `<Theme mode>`, the toast's inverted-surface text/icon could compute to the same color as its own background. useToast now re-provides the mode read off `<html data-theme>` (the attribute #1587 already syncs), kept live via a MutationObserver.
@let-sunny
