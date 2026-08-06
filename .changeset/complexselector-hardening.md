---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: hardening pass for family consistency (#4710). The trigger now announces the current value (or placeholder) to screen readers after the label; `status` renders the shared input border and hover-shadow treatment plus the status icon anatomy, including the focusable tooltip-variant details button; the duplicate focus outline is removed so only the shared wrapper ring shows; ArrowUp opens the popup like ArrowDown; `size` resolves through SizeContext like sibling inputs; the placeholder resolves from its own `@astryx.complexSelector.placeholder` i18n key; and a `ref` prop forwards to the trigger wrapper. Trigger accessible names now include the value, so queries like `getByRole('button', {name: 'Label'})` should become `{name: 'Label Value'}` or a regex. If you override `@astryx.selector.placeholder` in your own locale catalogs, add the same override for `@astryx.complexSelector.placeholder` — ComplexSelector no longer reads Selector's key.

@AKnassa
