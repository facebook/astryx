---
'@astryxdesign/core': patch
---

[fix] StatusDot: pair each variant with a distinct built-in shape — success stays a filled dot, neutral renders as a ring, error gets a minus bar, warning a bang, accent a plus — so status no longer relies on colour alone (WCAG 2.1 SC 1.4.1), matching AvatarStatusDot's shape language for the statuses both components share. Themes can target the new stable `astryx-statusdot-glyph` class and its `data-shape` attribute — a stroked inline `<svg>` painted from the dot's `currentColor`.
@bhamodi
