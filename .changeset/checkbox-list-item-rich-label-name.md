---
'@astryxdesign/core': patch
---

[fix] CheckboxListItem: a ReactNode `label` now names the checkbox from its visible text through `aria-labelledby`, the way RadioListItem already does, instead of falling back to the generic name "Checkbox". `aria-label` still replaces that name; a rich label with no text at all needs it, as it does for RadioListItem. The dev-time warning that asked for `aria-label` on every rich label is gone.

@Kyujenius
