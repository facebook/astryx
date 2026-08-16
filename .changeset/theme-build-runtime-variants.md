---
'@astryxdesign/cli': patch
---

[fix] Include custom component values in built themes so `astryx component` can mark them with `*` and a theme footnote. Runtime metadata and TypeScript augmentations use the same classified values from root, `onDark`, and `onLight` overrides, including custom Heading types. Built-in values and props without an augmentation point remain excluded.

For a configured theme package whose source export lacks this metadata, read it from the package's matching `/built` export when available. Existing source metadata takes precedence, and themes without a built companion or custom values continue to resolve as before.

@jiunshinn
