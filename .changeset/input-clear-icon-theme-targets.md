---
'@astryxdesign/core': patch
---

[feat] Every clearable input now renders its clear (✕) affordance through the shared `InputClearButton`, so the glyph is themeable in one place via the `astryx-input-clear-icon` target instead of a per-component target or a fragile descendant selector. The component-specific `astryx-{date-input,date-range-input,selector,multi-selector}-clear-icon` targets still render for a deprecation window — migrate to `input-clear-icon`. Inputs that rolled their own clear button now match the shared ghost-button look.

@freddymeta
