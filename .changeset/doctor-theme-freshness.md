---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor` now checks that built theme output is in step with its `defineTheme()` source. This is the one silent failure in the theming pipeline: a stale built theme still carries `__built`, so the runtime skips style injection and the app renders the previous theme with no error and no warning.

The check finds built output by its `@generated` banner and reuses the exact `Source:` and `--out` recorded there, so it compares against the real artifacts rather than guessing paths. A project with no built output is skipped: importing a `defineTheme()` source directly (runtime injection) cannot go stale.

Only drift is a failure. And when a `predev`/`prebuild` script already rebuilds the theme, drift on disk is reported as `info` rather than `fail`, since nothing ever consumes the stale output.

Also generalizes the doctor engine so a check may be sync or async and runs in its declared position. Previously the list was sync-only and `checkConfig` was spliced in by comparing each function against `checkThemes` by identity, which supported exactly one async check and hid its ordering from the list.
@josephfarina
