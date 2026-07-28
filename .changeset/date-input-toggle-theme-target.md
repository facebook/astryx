---
'@astryxdesign/core': patch
---

[feat] DateInput: add a dedicated `astryx-date-input-toggle` theme target for the calendar-toggle button, so consumers can theme it (color, size, hover, per open/closed state) via `defineTheme` instead of a fragile descendant selector. Reflects the popover's open/closed state as a `data-state` attribute (`expanded`/`collapsed`); default rendering is unchanged.

@freddymeta
