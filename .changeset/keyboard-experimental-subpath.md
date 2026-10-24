---
'@astryxdesign/core': patch
---

[experimental] `@astryxdesign/core/keyboard/experimental` exports the keyboard layout guide for components that keep content above the software keyboard: `getKeyboardLayoutGuide(window)`, the `useKeyboardLayoutGuide(onTransition, {overlayFor})` hook, `rideKeyboard(animator, values, transition)`, and the `KeyboardLayoutGuide`, `KeyboardTransition`, `KeyboardCurve` and `KeyboardProfile` types. Each transition starts where the keyboard really is (dated back on Mobile Safari, at Chrome's report on Android), and `rideKeyboard` plays the keyboard's own motion from there: UIKit's keyboard spring, or Android's keyboard curve. `overlayFor` names a field that moves itself above the keyboard; while it has focus, Chrome overlays the keyboard instead of panning the page. Like the other experimental subpaths, it may change or be removed in a patch release.

@vjeux
