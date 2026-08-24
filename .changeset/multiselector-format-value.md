---
'@astryxdesign/core': patch
---

[component] MultiSelector: rename the unreleased `formatTriggerCount` prop to `formatValue` and widen it to the whole trigger line. It now receives the selected items (`{value, label}[]`, count available as `.length`) and formats the trigger for `triggerDisplay="count"` and `"labels"`; `"badges"` renders elements, so it is not used there. `formatValue` matches NumberInput and Slider, so the same idea has one name across the system. Defaults are unchanged when the prop is absent.

@Kevinjohn
