---
'@astryxdesign/core': patch
---

[fix] NumberInput, DateInput, and DateTimeInput now set `aria-invalid="true"` and announce a short message (e.g. "Invalid number" / "Invalid date" / "Invalid time") via a visually-hidden `role="alert"` live region while the currently typed input is unparseable, instead of only dimming the text color and then silently reverting the value on blur. Screen-reader users now get feedback that their entry was rejected rather than silence, and the invalid state is no longer signaled by color alone (WCAG 3.3.1 Error Identification, 1.4.1 Use of Color). The revert-on-blur behavior is unchanged. (#3343)
@cixzhang
