---
'@astryxdesign/core': patch
---

[fix] The popup theme targets added in #4991 sat on the wrong element. `astryx-complex-selector-popup` and `astryx-multi-selector-popup` were rendered on each component's own content box — the one with the padding and the scroll — while the element that paints the popup's background, radius and elevation is the surface `usePopover` creates one level above it. A theme reaching for those classes to restyle a popup got a rule that could not paint it. Both now land on the surface, so they do what they were documented to do.

`Selector` gains the matching `astryx-selector-popup`, which its sibling `MultiSelector` had and it did not.

New: every popup surface carries the shared `astryx-popover-surface` class, so a theme can style all of them at once, and `usePopover` accepts a `surfaceTarget` naming the surface for a component that wants its own target there. A component cannot do this for itself — the surface belongs to `usePopover`, so any class it renders itself lands inside.

@cixzhang
