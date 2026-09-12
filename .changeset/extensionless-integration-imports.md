---
'@astryxdesign/cli': patch
---

[fix] Use extensionless subpath specifiers for generated integration imports

`integrationAddComponent` and `integrationAddTemplate` now emit extensionless
public import specifiers (`@pkg/components/MyWidget` instead of
`@pkg/components/MyWidget.tsx`) and map them to source files through the
package `exports` field. This makes the generated contract resolvable under
TypeScript's `moduleResolution: "node16"` (and `"bundler"`) without requiring
the consumer to enable `allowImportingTsExtensions`.

`integrationPackCheck` now validates TypeScript-consumer resolvability
unconditionally — including packages without an exports map, which previously
false-greened. It rejects specifiers ending in `.tsx`/`.ts` and uses
TypeScript's `resolveModuleName` API under `node16` resolution to confirm that
extensionless subpaths resolve through the exports map.

@josephfarina
