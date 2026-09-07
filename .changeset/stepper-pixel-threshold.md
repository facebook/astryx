---
'@astryxdesign/core': minor
---

[breaking] Restrict `Stepper`'s `horizontalOptions.minimumStepWidth` to a pixel number and remove compact-layout implementation fields from `useStepperContext`.

Replace CSS-length thresholds such as `'7rem'` with their intended pixel number. Call `registerStep(index, {getIsDisabled})` instead of passing a disabled boolean; the options object is optional. `StepperContextValue` keeps transition history and step registration, while step count, compact state, summary-portal coordination, and threshold measurement remain package-internal.

@imdreamrunner
