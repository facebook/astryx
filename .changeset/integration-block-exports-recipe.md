---
'@astryxdesign/cli': patch
---

[docs] Document the minimal `package.json#exports` recipe an integration needs so its block templates are importable by a bundler-resolution consumer and type-check under `moduleResolution: bundler`: `"./templates/*.tsx": "./templates/*.tsx"` plus an extensionful `import('@acme/widgets/templates/…/…Showcase.tsx')`. Adds `packages/cli/docs/integration-authoring.md` and a fixture test proving the recipe against the repo's own `tsc` and `esbuild`.

@ejhammond
