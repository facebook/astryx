---
'@astryxdesign/cli': patch
---

[fix] Use extensionless subpath specifiers for generated integration imports

`integrationAddComponent` and `integrationAddTemplate` now emit extensionless
public import specifiers (`@pkg/components/MyWidget` instead of
`@pkg/components/MyWidget.tsx`) and map them to source files through the
package `exports` field. Consumer imports no longer expose the package's source
extension or require `allowImportingTsExtensions`.

`integrationPackCheck` now rejects public specifiers ending in `.tsx` or `.ts`
and validates each exact import from the packed artifact through Node's package
resolver. Packages without a usable public export fail the check, and the
result does not depend on project-local TypeScript.

@josephfarina
