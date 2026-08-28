---
'@astryxdesign/core': patch
---

[fix] Kbd: render the `esc` and `return` aliases with the same glyphs and accessible names as `escape` and `enter`

This partial fix for #5403 normalizes the two unambiguous aliases already accepted by `useHotkeys`. Kbd now renders `esc` as `Esc` with the accessible name `Escape`, and `return` as `↵` with the accessible name `Enter`. Its lookup tables now also avoid prototype-chain collisions when rendering arbitrary key names. The platform-specific rendering contract for `meta` and display choice for `space` remain unresolved in #5403 pending separate API and design decisions.

@harjothkhara
