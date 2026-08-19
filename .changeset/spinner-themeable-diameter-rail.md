---
'@astryxdesign/core': patch
---

[feat] Spinner: size diameters and the rail (ring stroke) width are now themeable per size variant. The `size` prop stays the same fixed enum, but a theme can redefine what each named size resolves to via the `--_spinner-diameter` and `--_spinner-rail-width` custom properties on the size-variant target — e.g. `spinner: { 'size:xl': { '--_spinner-diameter': '40px', '--_spinner-rail-width': '6px' } }`. The canvas reads the resolved values back and falls back to the built-in defaults, so output is unchanged unless a theme overrides them.

@freddymeta
