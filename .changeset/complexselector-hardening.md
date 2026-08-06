---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: hardening pass for family consistency (#4710). The trigger is now `role="combobox"` with `aria-haspopup="dialog"`, so screen readers announce the current value (or placeholder) from the combobox value slot like Selector/MultiSelector, and `aria-required`/`aria-invalid` sit on a role that supports them; `status` renders the shared input border and hover-shadow treatment plus the status icon anatomy, including the focusable tooltip-variant details button; the duplicate focus outline is removed so only the shared wrapper ring shows (and a new shared `inputStatusFocusShadowStyles` keeps that ring visible when a status is set); ArrowUp opens the popup like ArrowDown; `size` resolves through SizeContext like sibling inputs; the placeholder resolves from its own `@astryx.complexSelector.placeholder` i18n key; and a `ref` prop forwards to the trigger wrapper. The trigger role changed, so queries like `getByRole('button', {name: 'Label'})` should become `getByRole('combobox', {name: 'Label'})`. If you override `@astryx.selector.placeholder` in your own locale catalogs, add the same override for `@astryx.complexSelector.placeholder` — ComplexSelector no longer reads Selector's key.

@AKnassa
