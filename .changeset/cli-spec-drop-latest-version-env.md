---
'@astryxdesign/cli': patch
---

[fix] The CLI no longer reads or sets the `ASTRYX_LATEST_VERSION` environment variable. Its only effect was an `FYI: A newer version of @astryxdesign/core ...` line on stderr after `astryx component` and `astryx docs`, and a CLI run cannot set a variable for later runs, so the line appeared only when the variable was set by hand. Commands now print the same output whether or not it is set. (#6554)

@josephfarina
