---
'@astryxdesign/core': patch
---

[feat] Text & Heading: `color` is now theme-extensible. `TextColor` is derived from a new `TextColorMap` interface (same technique as `ButtonVariantMap` etc.), so a theme can add custom text colors — `astryx theme build` generates the module augmentation when it sees new `color:*` values on Text/Heading overrides, and consumers can augment `TextColorMap` manually for type safety. A custom color renders as a stable class (`astryx-text.<color>` / `astryx-heading.<color>`) that theme CSS paints, falling back to the `primary` StyleX baseline so it never renders unstyled. Built-in colors are unchanged.
@freddymeta
