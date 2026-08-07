---
'@astryxdesign/core': patch
---

[feat] Add a standalone `RadioControl` primitive — a self-contained radio input and circle that works on its own via props (no `RadioList` context), for composing radios into bespoke surfaces (cards, table cells, custom rows). The API mirrors the checkbox family's control conventions: required `label` (accessible name, applied as `aria-label` per the icon-only `Button` convention), `isChecked`, `htmlName`, `onChange(value, e)`, `size`, `isDisabled`, `isRequired`, and `disabledMessage` (focusable-disabled with an AT-discoverable reason tooltip). `RadioListItem` composes it; its public API and rendered behavior are unchanged (its existing test suite passes untouched).

@freddymeta
