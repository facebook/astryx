---
'@astryxdesign/core': patch
---

[feat] Under a finger, the calendar in the DateInput and DateTimeInput bottom sheets now follows the iOS date picker's timing, on iPhone and Android alike:

- The month/year toggle cross-fades in 0.25 s on iOS's ease-in-out curve. It was DateInput's quick linear fade and DateTimeInput's instant swap. Once the sheet has settled, the hidden month/year wheels are laid out at opacity 0, and the toggle's own commit changes no inherited style (the hidden panel's `inert` follows a frame later), so on iPhone the fade is on screen from near its start.
- The title's chevron points along the reading direction and turns a quarter turn to point down while the wheels show. It was a down chevron that flipped up.
- A tapped day takes its selection at once, with no colour transition.

With a mouse, the calendar keeps today's toggle and day transition.

With Reduce Motion on (`design:reduced-motion`), nothing travels: under a finger the toggle cross-fades in 200 ms and the chevron dips instead of turning, where it used to finish in 0.01 s; with a mouse it changes at once.

@vjeux
