---
'@astryxdesign/core': patch
---

[fix] The calendar in the DateInput and DateTimeInput bottom sheets now follows the iOS date picker's timing:

- The month/year toggle cross-fades in 0.25 s on iOS's ease-in-out curve. It used to be a theme-speed linear fade in DateInput and instant in DateTimeInput. With Reduce Motion on, the fade and the chevron's turn keep their timing, since neither travels.
- The title's chevron points along the reading direction and turns a quarter turn to point down while the wheels show.
- A tapped day takes its selection at once, with no colour transition.

@vjeux
