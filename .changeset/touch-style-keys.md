---
'@astryxdesign/core': patch
---

[chore] The touch presentation resolver's style keys are exported as StyleX constants, `touchKeys` (`@astryxdesign/core/utils/touchPresentation.stylex`, proposed; pending owner review), for other packages. Core keeps spelling them literally (an imported `defineConsts` key compiles to a different StyleX priority than the same literal), and a test keeps every core literal equal to them. No style changes.

@vjeux
