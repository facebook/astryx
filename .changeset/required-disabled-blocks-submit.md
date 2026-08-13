---
'@astryxdesign/core': patch
---

[fix] CheckboxInput, Switch: a `required` control that is disabled with a `disabledMessage` no longer blocks the whole form from submitting. Showing the reason tooltip swaps the native `disabled` attribute for `aria-disabled`, which leaves the control subject to constraint validation — so an unchecked required checkbox (or an off required switch) the user has been told they cannot touch made the form permanently unsubmittable, with the browser reporting a validation error against a control they had no way to satisfy. Both now detach from the form via `form=""` while focusable-disabled, matching a natively disabled control and the treatment RadioListItem already applied. Enabled controls are unaffected — a required, unchecked checkbox still blocks submission as it should.
@josephfarina
