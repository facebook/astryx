---
'@astryxdesign/core': patch
---

[feature] Route checkbox and radio internals through the shared indicator components, so themes can restyle or replace one control visual everywhere it appears.

CheckboxInput, RadioList, and the DropdownMenu selectable items now render the
shared `CheckboxIndicator` / `RadioIndicator`. Default appearance is unchanged
for CheckboxInput, CheckboxList, RadioList, and Selector.

Two accessibility improvements fall out of the consolidation: the radio visual
picks up the `prefers-reduced-motion` transition override it previously lacked,
and menu radios gain the forced-colors (Windows High Contrast) treatment that
kept the selected dot perceptible — they had neither before.

**Migration — menu selection controls.** The painted circle in a
DropdownMenu radio row now carries the shared `radio` / `radio-dot` theme
targets; `dropdown-menu-radio` and `dropdown-menu-checkbox` narrow to the
marker box that owns size, order, and touch placement:

- `dropdown-menu-radio-dot` is removed. A theme styling the menu dot should
  target `radio-dot`, which now also reaches RadioList — style the radio once
  and it applies everywhere.
- A theme that painted the menu circle (fill, border, radius) through
  `dropdown-menu-radio` should move those rules to `radio`. Layout rules
  (size, order) stay where they are.
- `astryx theme build` reports `Unknown component "dropdown-menu-radio-dot"`
  for a theme still using the old key. Runtime themes are not validated, so
  check those by hand.
- Menu controls now use the standard 20/24px control sizes instead of a
  bespoke 18/22px, so a menu radio matches a RadioList radio.

@cixzhang
