---
'@astryxdesign/cli': patch
---

[docs] `astryx template --help` and the manifest now say which flags win when they are combined: `--cdn` overrides everything else and writes to its value, else to `<path>`, else `cdn.template.html`; `--list` ignores a name, a path, `--skeleton` and `--overwrite`; and `--skeleton` needs a name and writes nothing.

@josephfarina
