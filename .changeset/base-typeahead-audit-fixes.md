---
'@astryxdesign/core': patch
---

[fix] BaseTypeahead: preserve input props and keep results accessible in narrow layouts

BaseTypeahead now forwards its inherited DOM and styling props to the combobox input, preserves native input attributes unless a defined legacy alias overrides them, keeps empty result lists valid for assistive technology, counts visible characters for `minQueryLength`, and keeps both the popup and long result content within viewport gutters.

@cixzhang
