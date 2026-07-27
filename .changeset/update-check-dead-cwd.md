---
'@astryxdesign/cli': patch
---

[fix] Drop the dead `cwd` parameter from `getLatestVersion`

`checkForUpdate` called `getLatestVersion(cwd)` and the JSDoc advertised a `cwd` parameter, but the function takes no arguments — it only reads the `$ASTRYX_LATEST_VERSION` env var, so the passed `cwd` was silently ignored. Removed the phantom parameter and its doc so the signature matches the behavior. No functional change to the update-nudge output.

@josephfarina
