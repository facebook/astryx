---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[docs] Docs and CLI examples import each Core export from the path `astryx component <Name>` prints.

@josephfarina

- `VStack` and `HStack` come from `@astryxdesign/core/VStack` and `@astryxdesign/core/HStack`, `Heading` from `@astryxdesign/core/Heading`, `Text` from `@astryxdesign/core/Text`, and `Theme` and `defineTheme` from `@astryxdesign/core/theme`.
- This covers the guides, the `Card` docs, the next steps `astryx init` prints, the install example `astryx theme build` prints, the wiring example `theme add` prints, the build rules, the theme-module fix `astryx doctor` prints, and the annotated theme template.
- Every path was already exported. Nothing else changes.
