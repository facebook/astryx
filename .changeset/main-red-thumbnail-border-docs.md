---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] Two guards left failing on `main` by their own landings, so every PR since has been red through no fault of its own. #4963 gave Thumbnail's remove button a coarse-pointer hit-area var and did not document it, which the derived-var guard reads as an undocumented private var; the var is an `inset` on a `::after` overlay, so it is documented as private and listed alongside the other vars no standard CSS property maps onto. #5026 moved `borderDefaults` into `CoreTokenName` — the landing the theme-template guard was explicitly waiting for (its comment says "when #5017 lands, this guard starts requiring the template to cover it") — so the template's token inventory now names `--border-width`.

@cixzhang
