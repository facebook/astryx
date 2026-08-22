---
'@astryxdesign/core': patch
---

[feat] Theme: an app can declare its own semantic token. `defineTheme`'s `tokens` map used to be a closed union over Astryx's own token names, while the runtime happily emitted any token you gave it — so an app-owned token like `--color-layer-border` built correctly and then failed `tsc`. Declare it on the new `CustomTokens` interface (`declare module '@astryxdesign/core/theme'`), the same module-augmentation seam the variant maps and `CustomTextTypes` use. The union stays closed for every name nobody declared, so a typo is still a compile error.

@cixzhang
