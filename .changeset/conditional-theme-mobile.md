---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `defineTheme` gains a conditional theme layer: named conditions whose values apply only where the condition matches, starting with `mobile`. A `mobile` block takes a partial theme (`typography`, `color`, `radius`, `motion`, `tokens`, `components` — each axis independent) and compiles to `@media (max-width: <breakpoint>px) and (pointer: coarse)`, so it means narrow _and_ touch: a narrowed desktop window never matches. The width defaults to 756px and is configurable with `breakpoints: {mobile: 640}`. Inside a matching condition the conditional value wins over the base theme; outside it the base theme is untouched. The feature is opt-in — a theme that sets no condition emits no conditional CSS and its output is byte-identical to before. Works in both distribution modes: runtime `<Theme>` injection and `astryx theme build`.

A condition's type scale inherits: `base` and `ratio` are both optional and fall back to the theme's own scale, so a condition states only what differs. `scale.pin` holds one role (`'display-1'`…`'heading-3'`, or `'auto'` to pick by ratio) at the size it has in the desktop scale and re-derives the ratio around it — so flooring body to 16px on touch does not also grow the display tier. Unset means no pin: the desktop ratio is kept and the whole ladder lifts with the base.

A conditional layer is inherited through `extends` like every other axis: a child that declares none keeps its parent's, and one that declares its own merges over it per token. The scale, the breakpoint and a pin anchor all resolve against the effective (post-`extends`) theme, and each scale axis is merged over the theme's own config before expanding — so `mobile: {color: {contrast: 'high'}}` keeps the theme's accent instead of re-tinting the palette from the default.

@cixzhang
