---
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[fix] The `/built` entry now loads under Node ESM and externalized SSR (Vite `--ssr`, Remix / React Router v7): it imports `./icons.mjs` instead of the extensionless `./icons` Node cannot resolve.
@AKnassa
