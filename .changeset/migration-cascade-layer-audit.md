---
'@astryxdesign/cli': patch
---

[docs] Add cascade-layer safety guidance to the migration guide (`astryx docs migration`): a Cascade Layer Safety audit checklist (layer position beats specificity, classify every stylesheet into a layer deliberately, never let an `@import` inherit a layer implicitly) and a Foundation Smoke Test section (one page with Button/TextInput/Card/Table plus a non-zero-padding assertion) so a broken layer order fails before feature work instead of after N migrated screens. The getting-started guide now points to it from the theme CSS step.

@jiunshinn
