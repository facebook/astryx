---
'@astryxdesign/core': patch
---

[fix] Theme icons: `defineTheme({icons})` now accepts library extension keys (e.g. `'richtext:bold'`) without a cast. The runtime already resolved any string key through `getIcon`/`getExtendedIcon`, but the `icons` field was typed over the built-in `IconName` union only, so themes could not declare overrides for library-contributed icons. Adds the `ExtendedIconRegistry` type (built-in names plus colon-namespaced extension keys, so misspelled built-in names still fail to compile) and widens `defineTheme`'s input and `DefinedTheme` to it. `getIconRegistry` keeps extension keys out of its typed `IconRegistry` snapshot, per its documented contract.

@AKnassa
