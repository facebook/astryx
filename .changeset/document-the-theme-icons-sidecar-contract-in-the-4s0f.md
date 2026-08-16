---
'@astryxdesign/cli': patch
---

[docs] `docs theme` now documents the icons sidecar contract: when a theme declares an `icons:` registry, the JS module that `theme build` generates imports it from a sibling path, and producing a loadable module there is the caller's job (#4621)
@jiunshinn

The build deliberately never compiles the registry (it runs first in the pipeline, so at codegen time the compiled sidecar legitimately does not exist yet), and skipping the compile step is silent: the build exits 0 and bundlers keep resolving `./icons` to the source `icons.tsx`, while Node fails with `ERR_MODULE_NOT_FOUND`. The Building Themes for Production section now states the contract, shows the two-step recipe the shipped theme packages use (`theme build --icons-specifier ./icons.mjs` plus an esbuild compile of the registry), and names the failure mode. The dense and zh overlays carry the same contract.
