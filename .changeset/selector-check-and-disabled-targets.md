---
'@astryxdesign/core': patch
---

[feat] Selector/MultiSelector: two additive theming seams (#4626, #4627). A `selector-check` theme target on the selected-row checkmark lets themes restyle or hide it (e.g. to compose their own selected indicator via `renderOption`) instead of relying on a structural sibling selector, and `data-disabled` now reflects on the trigger for theme-driven disabled styling. Rotation styles remain on the indicator-icon target. Default appearance is unchanged.

@athz
