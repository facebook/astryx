---
'@astryxdesign/core': patch
---

[feat] DateInput: on a touch device the field now opens the browser/OS date
picker instead of the in-page calendar

A phone tapping the calendar toggle got a 320px month grid in a popover: a
desktop control shrunk onto a screen where the platform already ships a date
picker every user knows, with system-sized hit areas, momentum scrolling, and
the OS locale and accessibility settings applied for free.

DateInput now renders `<input type="date">` when the pointer is coarse, so iOS
shows its wheel and Android its calendar dialog. The new `nativePicker` prop
takes `'touch'` (the default — native on touch), `'always'`, or `'never'` for a
field that must look identical on every device. The switch is client-side, so
SSR still renders the text field; a browser without `type="date"` support keeps
it too.

In native mode the browser owns the picker, so `numberOfMonths` and
`weekStartsOn` no longer apply — they describe a calendar grid the native
picker does not have. `format` and `placeholder` do still apply: DateInput
paints the closed field's text itself, over the control, so a date reads the
same on a phone as on a desktop. (A desktop control whose segments the browser
lets you type into hands its text back while focused; a touch picker has no
segments, so ours holds throughout.) `min` and `max` carry over;
`dateConstraints` cannot — a native picker only expresses a contiguous range —
so `'touch'` keeps the Calendar popover whenever constraints are set.

@imdreamrunner
