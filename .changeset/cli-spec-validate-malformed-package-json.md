---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate`, `templates`, `components`, and `docs` now show the `invalid_package_json` error when a local integration's package.json can't be parsed. Before, the text output said no `astryx.integration.*` file was found and hid the error, because the JSON reported a null `name`, which means no manifest. In that case `data.name` is now `(local package)`. (#6559)

@josephfarina
