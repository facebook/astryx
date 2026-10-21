---
'@astryxdesign/core': patch
---

[fix] A disabled field that keeps keyboard focus now shows where focus is. The input wrapper shared by text, number, date, time, and selector fields used to drop its focus border and ring while disabled, so a disabled field reachable by Tab (for example a `Selector` with a `disabledMessage`) showed no focus at all. It now draws the same focus ring as an enabled field, dimmed with the rest of the disabled control. Fields whose disabled control cannot take focus look the same as before.

@cixzhang
