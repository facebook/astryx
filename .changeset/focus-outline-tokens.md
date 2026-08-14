---
'@astryxdesign/core': patch
---

[feat] The keyboard focus ring is now a theme token. `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color` and `--focus-outline-offset` drive every ring in core and lab, so one override in a theme's `tokens` restyles focus system-wide; the color tracks `--color-accent` unless a theme sets it. The `:focus-visible` condition is not themeable, so a themed ring still cannot appear for pointer users (#4973).

Every ring is now drawn from the shared focus-outline utility rather than written out per component, and a lint rule keeps it that way. Two corrections come with that: the rings that had drifted to a 2px offset (Slider, Switch, Lightbox, ProgressBar, and lab's InfoTip, Step and LogStream) now sit at the documented 3px, and the buttons inside a field — the Date, DateRange and DateTime calendar toggles, the DateRange presets, and the Selector and MultiSelector status buttons — draw the standard 2px ring instead of a 1px one.

@cixzhang
