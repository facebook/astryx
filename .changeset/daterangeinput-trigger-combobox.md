---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: expose the trigger as `role="combobox"` (matching DateInput/DateTimeInput) so `aria-required` is valid — it is not allowed on `role=button` (axe aria-allowed-attr, critical). Tests locating the trigger via `getByRole('button', {name})` must switch to `getByRole('combobox')`.
@AKnassa
