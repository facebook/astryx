---
'@astryxdesign/core': patch
---

[fix] TreeList's `onKeyDown` prop now runs before the built-in arrow-key/expand-collapse handling, so calling `event.preventDefault()` reliably cancels the built-in behavior for that key instead of running too late to matter. (#5584)

@HelloOjasMutreja
