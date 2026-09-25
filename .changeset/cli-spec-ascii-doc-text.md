---
'@astryxdesign/cli': patch
---

[fix] The text output of `astryx component` and `astryx hook` no longer adds non-ASCII characters of its own. Empty table cells show `-` instead of an em dash, the brief view's import hint reads `<- from`, derived properties and deprecated targets use `->`, and brief prop and parameter lists are separated by commas instead of middle dots. Text that comes from the docs themselves is unchanged. (#6553)

@josephfarina
