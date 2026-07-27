---
'@astryxdesign/core': patch
---

[fix] AvatarStatusDot: pair each variant with a distinct built-in shape — success stays a filled dot, neutral renders as a ring, error gets a minus bar — so status no longer relies on colour alone (WCAG 2.1 SC 1.4.1, #4143). A rendered `icon` replaces the shape glyph at sizes where icons fit; themes can target the new stable `astryx-avatar-status-dot-glyph` class and its `data-shape` attribute — a stroked inline `<svg>` painted from the dot's `currentColor`.
@AKnassa
