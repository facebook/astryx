---
'@astryxdesign/core': patch
---

[fix] Popover: theming `popover.borderRadius` now changes the rendered radius. The `astryx-popover` target moves onto the popup surface — the box that paints background, radius and elevation — and `usePopover` reads the registered `--_popover-radius` there instead of hardcoding `--radius-container`. Content padding moves with it, so a themed `padding` still replaces the default instead of nesting inside it.

@cixzhang
