---
'@astryxdesign/core': patch
---

[feat] Field: control how the required/optional indicator is displayed. `Field` and `FieldLabel` gain `requiredIndicator` (`'text' | 'asterisk' | 'none'`) and `optionalIndicator` (`'text' | 'none'`) props, and a new `FieldProvider` sets the default for a whole subtree — e.g. mark only optional fields by rendering nothing for required ones. `'asterisk'` shows a red `*` while keeping the localized word for screen readers, and the control's `aria-required` is unaffected in every mode. Defaults to `'text'`, so existing fields are unchanged.
@freddymeta
