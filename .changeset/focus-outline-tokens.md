---
'@astryxdesign/core': patch
---

[feat] The keyboard focus ring is now a theme token. `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color` and `--focus-outline-offset` drive every ring in core and lab, so one override in a theme's `tokens` restyles focus system-wide; the color tracks `--color-accent` unless a theme sets it. The `:focus-visible` condition is not themeable, so a themed ring still cannot appear for pointer users.

Rings that had drifted to a 2px offset (Slider, Switch, Lightbox, ProgressBar, the field status button, and lab's InfoTip, Step and LogStream) now sit at the documented 3px.

@cixzhang
