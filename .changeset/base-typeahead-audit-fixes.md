---
'@astryxdesign/core': patch
---

[fix] BaseTypeahead: preserve input props and keep results accessible in narrow layouts

BaseTypeahead now forwards its inherited DOM and styling props to the combobox input, keeps empty result lists valid for assistive technology, counts visible characters for `minQueryLength`, and clamps the result popup to the viewport.

@cixzhang
