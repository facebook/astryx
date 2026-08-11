---
'@astryxdesign/core': patch
---

[feat] Selector and MultiSelector expose a `*-search-input` theme target (`astryx-selector-search-input`, `astryx-multi-selector-search-input`) on the in-dropdown search field, so a theme can restyle just that field's surface (border, background, radius, focus ring) and placeholder via `defineTheme` — e.g. to render the search borderless and flush in the popover — instead of a structural descendant selector. The target composes with the field's own `text-input` class through TextInput's `className` passthrough. Purely additive — default rendering is unchanged.

@freddymeta
