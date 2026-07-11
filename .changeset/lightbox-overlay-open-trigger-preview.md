---
'@astryxdesign/core': patch
---

[docs] Document when playground.overlay applies: components with no inline containment (MobileNav, Lightbox) use it, while Dialog, AlertDialog, and CommandPalette intentionally keep their contained isInline previews so knobs stay usable. Adds regression tests guarding both shapes (#3657)
@AKnassa
