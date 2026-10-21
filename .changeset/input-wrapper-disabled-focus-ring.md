---
'@astryxdesign/core': patch
---

[fix] A disabled field that keeps keyboard focus now shows where focus is. The input wrapper shared by text, number, date, time, and selector fields used to drop its focus border and ring while disabled, so a disabled field reachable by Tab (for example a `Selector` with a `disabledMessage`) showed no focus at all. While the field's own disabled control holds focus, the wrapper now draws the same focus ring as an enabled field, dimmed with the rest of the disabled control. Focus on a companion control inside the field, such as a status tooltip button or a toolbar button, keeps only that control's own indicator, and a field whose disabled control cannot take focus looks the same as before.

@cixzhang
