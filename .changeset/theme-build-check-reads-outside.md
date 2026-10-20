---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build --check` and `themeBuild({check: true})` keep comparing outputs outside the working directory, as the latest release does, rather than refusing them with `ERR_PATH_TRAVERSAL` the way a build does. Check mode writes nothing, so the write confinement of `architecture:cli-surface/INV10` and `INV10a` does not apply to it: an absolute `--out` path outside the working directory, a theme file outside it whose outputs sit beside it, and `--family` with its root theme file outside it are each checked read-only. A relative `--out` path that escapes the working directory is still refused, as before. Builds keep refusing every one of these writes, so when such outputs are stale, the report no longer ends with a `Rebuild with:` command the build refuses. It names the nearest directory that contains the theme files and the outputs, and the build and check commands to run from there: each output's `Source:` header records the directory its build ran from, so the check passes only from that same directory. Stale outputs inside the working directory keep the `Rebuild with:` line.

@josephfarina
