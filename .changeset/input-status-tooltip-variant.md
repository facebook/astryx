---
'@astryxdesign/core': patch
---

[feat] Bordered inputs gain a `statusVariant="tooltip"` option that hides the status message box and surfaces the status as an info-tip on the on-field status icon. The icon is a real focusable button so the status is reachable by everyone: keyboard users tab to it (with a visible focus ring) and see the message on focus, pointer users see it on hover, and touch users tap to toggle it. The message is piped into both the input's and the button's `aria-describedby`, and the tooltip is dismissible with Escape. Added to TextInput, TextArea, NumberInput, DateInput, DateRangeInput, TimeInput, and FileInput.

@cixzhang
