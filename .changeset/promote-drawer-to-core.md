---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[component] Promote `Drawer` and `DrawerHeader` from the canary-only Lab package to Core, imported from `@astryxdesign/core/Drawer` or the package root. The stable package now ships the full-height side panel with modal and non-modal presentation, the shared dismissal stack, Dialog's `purpose` dismissal policy, a `DrawerHeader` whose close button appears when given `onOpenChange`, and Dialog-style container padding (`--spacing-4` by default, `padding` prop, or a theme's `drawer` padding), plus Core documentation and runnable examples. Canary users importing from `@astryxdesign/lab` switch to `@astryxdesign/core/Drawer`.

@imdreamrunner
