---
'@astryxdesign/core': patch
---

[feat] Card: new `elevation` prop mapping to the shadow token scale (`low`/`med`/`high` -> `--shadow-low`/`--shadow-med`/`--shadow-high`). Elevated cards drop the `default` variant's border so a floating card over media or color no longer needs custom boxShadow CSS. (#2601)
@jiunshinn
