---
'@astryxdesign/core': patch
---

[fix] SegmentedControl and SegmentedControlItem forward data-testid to the DOM

Both components declared `BaseProps` (so `data-testid` and other `data-*`
attributes type-check) but silently dropped them: neither captured `...rest` nor
spread the remaining props onto its rendered element, so the attribute never
reached the DOM. They now capture `...rest` and spread it onto the radiogroup
`<div>` / radio `<button>` (the same rest-spread fix applied to `CheckboxInput`
in #3738), placed before the component's own `role`/`aria-*` so those can't be
overridden.

@let-sunny
