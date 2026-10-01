---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `<Theme density="compact">` makes a region dense with one prop: spacing steps 3–12 shrink to 0.75×, the type ramp steps down about one step (body 14→13px, supporting 12→11px), and controls, `Table` rows, and `SideNavItem`/`TopNavItem` rows default to their small size. An explicit `size` or Table `density` still wins.

Values derive from the theme's own tokens and are written as custom properties on the Theme root, so server HTML carries them in light and dark. A nested Theme inherits the density; `density="default"` restores the standard scale inside a compact region. Without the prop, rendering is unchanged. Nav heading hit boxes keep a floor so compact spacing cannot shrink them under their targets. `astryx docs theme` gains a Density section, and the agent rules name compact density for dense tools.

@thedjpetersen
