---
'@astryxdesign/cli': minor
---

[breaking] Integration themes use typed same-stem descriptors, not a central catalog.

A themes root no longer holds `manifest.json`, the theme catalog that `astryx integration add theme` wrote in 0.6 (stable since 0.6.3). Each theme carries a strongly typed `<name>Theme.doc.mjs` beside its source instead, and a themes root that still holds the catalog is refused. To migrate an integration package, run `astryx upgrade --from 0.6.3 --path . --apply` in it: a codemod writes each theme's descriptor from its catalog entry and removes the catalog. Until a package is migrated, apps that install it get none of its themes or doc topics.

Theme discovery reads descriptors and checks integration theme sources without executing them, and `theme add` copies an integration theme's complete directory. `astryx doctor integration validate` warns about a folder in the themes root that looks like a theme but is not read as one. New component, topic, and template scaffolds also emit type-annotated `.doc.mjs`; released `.template.*` inputs remain readable.

@josephfarina
